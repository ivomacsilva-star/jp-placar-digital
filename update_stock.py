"""Read only the public catalogue; never persist raw API data or public site tokens."""
import json, re, unicodedata, urllib.request, io, os, tempfile
from datetime import datetime, timezone
from pathlib import Path
import qrcode
from PIL import Image
ROOT=Path(__file__).resolve().parent
BASE='https://multidealer.easysite.pt/assets/jorgepinheiro.pt/'
def fetch(url,headers=None):
    with urllib.request.urlopen(urllib.request.Request(url,headers=headers or {}),timeout=40) as r: return r.read()
def slug(s):
    s=unicodedata.normalize('NFD',s.lower().strip())
    s=''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'\s+','-',re.sub('[^a-z0-9 -]','',s))
def build(raw):
    if not isinstance(raw,list) or not raw: raise ValueError('Catálogo vazio ou inválido')
    cars=[]
    for c in raw:
        if type(c.get('Vendido')) is not bool: raise ValueError('Estado de venda desconhecido')
        if c['Vendido'] or c.get('Reservado') or c.get('DisponivelBrevemente'): continue
        ident=str(int(c['CodViatura']))
        marca,modelo=c['Marca']['Nome'],c['Modelo']['Nome']
        url='https://jorgepinheiro.pt/carros/%s/%s/%s/'%(slug(marca),slug(modelo),ident)
        files=sorted(c['Ficheiros'],key=lambda x:not x.get('Principal'))
        if not files: continue
        images=list(dict.fromkeys(f['Ficheiro'] for f in files))[:4]
        if any(not image.startswith('https://cdn.easysite.pt/pub/21996/') for image in images): raise ValueError('Imagem fora do catálogo')
        cars.append(dict(id=ident,title=marca+' '+modelo,version=c.get('VersaoAlternatica') or c.get('Motorizacao',''),year=c['Ano'],km=c['Km'],fuel=c['Combustivel']['Nome'],price=None if c.get('NaoExportarPreco') else c['Preco'],url=url,source_images=images,sold=False,reserved=False))
    if not cars: raise ValueError('Sem viaturas disponíveis: manter publicação anterior e investigar')
    return cars

def main():
    env=json.loads(fetch(BASE+'env'))
    raw=json.loads(fetch('https://ws.easydata.pt/v1/easydata/carros/GetListaDetalhesViatura/?dealer_id=21996',{'token':env['REACT_APP_TOKEN_API'],'Origin':'https://jorgepinheiro.pt'}))
    cars=build(raw)
    # All assets must succeed before publishing a new catalogue. CI deployment is atomic.
    assets=ROOT/'assets'; assets.mkdir(exist_ok=True)
    for c in cars:
        ident=c['id']; c['images']=[]
        for number, source in enumerate(c.pop('source_images')):
            image=Image.open(io.BytesIO(fetch(source))).convert('RGB')
            image.thumbnail((1600,1200))
            filename=ident+'-'+str(number+1)+'.jpg'
            image.save(assets/filename,quality=88)
            c['images'].append('assets/'+filename)
        qrcode.make(c['url'],error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=10,border=4).save(assets/(ident+'-qr.png'))
        c['image']=c['images'][0]; c['qr']='assets/'+ident+'-qr.png'
    data=dict(updated_at=datetime.now(timezone.utc).isoformat(),source='https://jorgepinheiro.pt/automoveis/',cars=cars)
    content=json.dumps(data,ensure_ascii=False)
    (ROOT/'stock.json').write_text(content)
    (ROOT/'stock.js').write_text('window.P034_STOCK='+content+';')
    print('Stock publicado:',len(cars),'viaturas; vendidos/reservados excluídos.')
if __name__=='__main__': main()
