import { ReportCategory, ReportPriority } from '../dto/ai-analysis.dto';

interface ReportInput {
  title: string;
  description: string;
  location?: string;
}

/**
 * Prompt Engineering para Triagem Inteligente de Relatórios Urbanos
 */
export function buildReportTriagePrompt(input: ReportInput): string {
  return `Você é um sistema especializado de triagem para zeladoria urbana de prefeituras brasileiras.

**TAREFA:** Analise o relato do cidadão e retorne APENAS um objeto JSON válido.

**ENTRADA:**
Título: "${input.title}"
Descrição: "${input.description}"
${input.location ? `Localização: "${input.location}"` : ''}

**INSTRUÇÕES:**
1. Categorize em uma das opções: ${Object.values(ReportCategory)
    .map((c) => `"${c}"`)
    .join(', ')}
2. Avalie a prioridade (BAIXA, MEDIA, ALTA) baseado em:
   - ALTA: risco à vida, segurança pública, emergência
   - MEDIA: problema que causa grande incômodo ou pode piorar rapidamente  
   - BAIXA: problemas estéticos ou não urgentes
3. Reescreva o relato de forma técnica, objetiva e impessoal para gestores públicos

**EXEMPLOS:**

Exemplo 1:
Entrada: "Tem um buraco enorme aqui na frente"
Saída: {
  "category": "Manutenção de Vias",
  "priority": "MEDIA",
  "technicalSummary": "Solicitação de reparo de via pública devido à presença de buraco de dimensões consideráveis na via, com potencial de causar danos a veículos e riscos a pedestres."
}

Exemplo 2:
Entrada: "Poste de luz apagado há 2 semanas na rua escura"
Saída: {
  "category": "Iluminação Pública",
  "priority": "ALTA",
  "technicalSummary": "Solicitação de reparo urgente de iluminação pública com poste inoperante há aproximadamente 14 dias, representando risco à segurança dos cidadãos em via de baixa visibilidade noturna."
}

Exemplo 3:
Entrada: "Esgoto vazando na calçada, com mau cheiro"
Saída: {
  "category": "Saneamento",
  "priority": "ALTA",
  "technicalSummary": "Solicitação de reparo urgente em rede de esgotamento sanitário com vazamento ativo em passeio público, gerando insalubridade e potencial risco à saúde pública."
}

Exemplo 4:
Entrada: "Praça com grama alta e mato crescendo"
Saída: {
  "category": "Áreas Verdes",
  "priority": "BAIXA",
  "technicalSummary": "Solicitação de manutenção paisagística em área verde pública com necessidade de poda de grama e remoção de vegetação invasiva para preservação estética do espaço urbano."
}

Exemplo 5:
Entrada: "Lixo acumulado na esquina há dias"
Saída: {
  "category": "Limpeza Urbana",
  "priority": "MEDIA",
  "technicalSummary": "Solicitação de limpeza urbana devido ao acúmulo de resíduos sólidos em via pública, com potencial de proliferação de vetores e comprometimento da salubridade urbana."
}

**RETORNE APENAS O JSON (sem markdown, sem explicações):**
{
  "category": "string",
  "priority": "BAIXA" | "MEDIA" | "ALTA",
  "technicalSummary": "string"
}`;
}

/**
 * Type guard para validar estrutura de saída da IA
 */
interface ValidatedOutput {
  category: string;
  priority: string;
  technicalSummary: string;
}

function isValidatedOutput(output: any): output is ValidatedOutput {
  if (!output || typeof output !== 'object') {
    return false;
  }

  const obj = output as Record<string, unknown>;

  return (
    typeof obj.category === 'string' &&
    typeof obj.priority === 'string' &&
    typeof obj.technicalSummary === 'string'
  );
}

/**
 * Validações de segurança para outputs da IA
 */
export function validateAIOutput(output: any): boolean {
  const validCategories = Object.values(ReportCategory);
  const validPriorities = Object.values(ReportPriority);

  if (!isValidatedOutput(output)) {
    return false;
  }

  const validatedOutput = output;

  return (
    validCategories.includes(validatedOutput.category as ReportCategory) &&
    validPriorities.includes(validatedOutput.priority as ReportPriority) &&
    validatedOutput.technicalSummary.length >= 10 &&
    validatedOutput.technicalSummary.length <= 500
  );
}
