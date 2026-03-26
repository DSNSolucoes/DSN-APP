# Relatórios (React) - Estrutura organizada

Este pacote contém uma reescrita em React com camadas separadas:
- `pages/Relatorios` (página principal de relatórios)
- `components/Relatorios` (um componente por relatório, com seu CSS)
- `services` (apiClient + combos + relatórios)
- `context` (EmpresaContext)
- `utils` (format e dates)

## Como usar no seu projeto
1. Copie as pastas para dentro do seu `src/` (ou mescle com o que já existe).
2. Garanta que o `App.css` do seu projeto já tem as variáveis `--bg`, `--card`, `--text`, `--muted`, `--border`, `--primary`, `--primary-text`.
3. Envolva seu app com `<EmpresaProvider>` (ex.: no `main.jsx`).
4. Aponte uma rota/menu para `RelatoriosPage`.

## Endpoints
Os endpoints em `services/relatoriosService.js` estão como *placeholders*.
Ajuste os paths conforme seu backend.

