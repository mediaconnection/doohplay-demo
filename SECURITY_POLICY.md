# Política de Assinatura Digital – DOOHPLAY

## Algoritmo
- Hash: SHA-256
- Assinatura: RSA
- Tamanho da chave: 2048 bits

## Processo
1. PDF é gerado integralmente
2. Hash SHA-256 é calculado
3. Hash é assinado com chave privada
4. PDF NÃO sofre alterações após assinatura

## Chaves
- Chave privada: protegida, não versionada
- Chave pública: versionada para verificação

## Verificação
- Recalcula hash
- Valida assinatura com chave pública

## Ambientes
- development
- staging
- production
