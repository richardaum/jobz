# HMR / Hot Module Replacement

## Configuração Atual

A extensão usa `@samrum/vite-plugin-web-extension` com HMR habilitado:

- ✅ **Hot Module Replacement**: Componentes React e arquivos TypeScript atualizam automaticamente
- ✅ **Dev Server**: Usa o dev server do Vite para rebuilds rápidos
- ✅ **Source Maps**: Habilitados para melhor debugging

## Como Funciona

O HMR funciona através do dev server do Vite que:

1. Observa mudanças nos arquivos fonte
2. Reconstrói apenas os módulos alterados
3. Envia atualizações via WebSocket para a extensão
4. A extensão aplica as mudanças sem recarregar completamente

## Limitações

- **Manifest.json**: Mudanças no manifest ainda requerem reload manual
- **Background Script**: Mudanças no background.js podem requerer reload manual
- **Content Scripts**: Podem requerer reload da página onde estão injetados

## Uso

```bash
bun run dev
```

Isso inicia o dev server com HMR habilitado. A maioria das mudanças será aplicada automaticamente.
