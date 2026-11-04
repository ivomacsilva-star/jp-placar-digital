# P034 — Placar Digital Jorge Pinheiro Automóveis

Protótipo independente, vertical 1080 × 1920, para o LG 55SM5KE-B. Rotação de 14 segundos, QR do anúncio, fotografias JPEG e JavaScript ES5 sem bibliotecas externas no leitor. O Mac só é necessário para desenvolver; o leitor final usa um URL HTTPS.

## Dados
Consulta apenas a API que alimenta o catálogo público de https://jorgepinheiro.pt/automoveis/. A configuração pública é obtida em memória a cada execução, nunca gravada nem incluída no placar. A saída usa uma lista explícita de campos; exclui vendidos, reservados e disponibilidade futura. Não publica matrículas, VIN, contactos ou respostas integrais da API. Respeita NaoExportarPreco e não anuncia prestações financeiras.

Viabilidade confirmada em 04/11/2026: 52 registos recebidos, 22 disponíveis, 30 vendidos excluídos. Consulta pública não constitui garantia de estabilidade nem autorização contratual do fornecedor. Confirmar condições de reutilização antes de exploração permanente.

## Atualizar
Python 3.9 ou superior:

    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
    .venv/bin/python update_stock.py

Servir a pasta por HTTP para pré-visualizar. Não abrir apenas um ficheiro local para testar atualizações. O leitor verifica stock.json a cada 5 minutos; após 24 horas sem dados recentes, oculta anúncios e preços. Uma falha de recolha deve impedir uma nova publicação. O workflow prepara o pacote completo e só depois publica.

## LG
A ficha técnica oficial indica webOS 4.0, vertical e Play via URL:
https://solutions.lg.com/us/digital-signage/lg-55SM5KE

Ainda não validado no aparelho. Testar orientação 1080 × 1920, HTTPS, fotografia, preço, leitura do QR com telemóvel, mudança após 14 segundos, atualização e recuperação após desligar/ligar. Não instalar equipamentos adicionais. O arranque automático depende das definições/firmware do ecrã e deve ser confirmado presencialmente.

## Publicar
Repositório tornado público com aprovação do proprietário em 04/11/2026. GitHub Pages configurado para GitHub Actions. A rotina `.github/workflows/stock.yml` atualiza o stock de duas em duas horas (minuto 17, UTC), permite execução manual e publica apenas os ficheiros do leitor e as imagens. Execuções agendadas podem sofrer atrasos; o leitor deixa de mostrar anúncios após 24 horas sem atualização. Em repositórios públicos, verificar periodicamente se o agendamento continua ativo. Primeira publicação validada em 04/11/2026 (22 viaturas; 30 vendidos excluídos). Endereço público: https://ivomacsilva-star.github.io/jp-placar-digital/ .

Não existem segredos ou permissões de gestão do fornecedor neste projeto. Não publicar a pasta work nem ficheiros brutos usados na investigação.
