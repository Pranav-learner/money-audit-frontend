import { Sparkles } from 'lucide-react';
import { PagePlaceholder } from '@/shared/components/common/page-placeholder';

export default function AiIntelligencePage() {
  return (
    <PagePlaceholder
      title="AI Intelligence"
      icon={Sparkles}
      description="Your conversational financial assistant and proactive intelligence."
      highlights={[
        'Ask questions about your finances in natural language',
        'Personalized recommendations, risk alerts and forecasts',
        'Powered by the backend Financial Intelligence engines',
      ]}
    />
  );
}
