/* R5 · GENERAL REQUEST (R5.1 empty · R5.1a ready) and
   R6 · FEATURE REQUEST (R6.1 empty · R6.1a ready). */

import { useState } from 'react';
import { Lightbulb, MessageSquare } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Input from '../../../../components/Input';
import Select, { SelectContent, SelectItem, SelectTrigger } from '../../../../components/Select';
import Textarea from '../../../../components/Textarea';
import type { Product } from '../../types';
import { FormShell, Row, useSubmission } from './shared';

const PRODUCTS: { value: Product; label: string }[] = [
  { value: 'DARTBoards', label: 'Dartboards' },
  { value: 'Aiden', label: 'Aiden' },
  { value: 'DART Central', label: 'DART Central' },
];

const CATEGORIES = ['Dashboards & reporting', 'Access & permissions', 'Data quality', 'Aiden & AI features', 'Something else'];

function ProductSelect({ id, value, onChange }: { id: string; value: Product; onChange: (p: Product) => void }) {
  return (
    <Select id={id} label="Application" required description="Which application this is about." value={value} onValueChange={(v) => onChange(v as Product)}>
      <SelectTrigger placeholder="Select…" />
      <SelectContent>
        {PRODUCTS.map((p) => (
          <SelectItem key={p.value} value={p.value} label={p.label} />
        ))}
      </SelectContent>
    </Select>
  );
}

export function GeneralForm() {
  const { phase, submit } = useSubmission();
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [product, setProduct] = useState<Product>('DARTBoards');

  const dirty = !!(topic || category || message || product !== 'DARTBoards');
  const ready = !!topic.trim() && !!category && !!message.trim();

  return (
    <FormShell
      id="ds-req-general"
      crumb="General Request"
      title="General Request"
      Icon={MessageSquare}
      color="default"
      ready={ready}
      phase={phase}
      dirty={dirty}
      onSubmit={() =>
        submit({
          type: 'general',
          product,
          title: topic.trim(),
          summary: message.trim(),
          fields: [
            { label: 'Topic', value: topic.trim() },
            { label: 'Application', value: PRODUCTS.find((p) => p.value === product)!.label },
            { label: 'Category', value: category },
            { label: 'Message', value: message.trim() },
          ],
        })
      }
    >
      <div className="ds-requests-fields">
        <Input
          id="ds-req-general-topic"
          label="Topic"
          required
          description="One-line summary of your request."
          placeholder="e.g. Add a saved view for the Servicing team"
          value={topic}
          onValueChange={setTopic}
        />
        <Row>
          <ProductSelect id="ds-req-general-product" value={product} onChange={setProduct} />
          <Select id="ds-req-general-category" label="Category" required description="What kind of request this is." value={category || undefined} onValueChange={setCategory}>
            <SelectTrigger placeholder="Select…" />
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} label={c} />
              ))}
            </SelectContent>
          </Select>
        </Row>
        <Textarea
          id="ds-req-general-message"
          label="Message"
          required
          rows={5}
          description="Describe your request in detail. The more context you give us, the faster we can help."
          placeholder="e.g. We check the same three filters every morning on Servicing Overview."
          value={message}
          onValueChange={setMessage}
        />
      </div>
    </FormShell>
  );
}

export function FeatureForm() {
  const { phase, submit } = useSubmission();
  const [title, setTitle] = useState('');
  const [describe, setDescribe] = useState('');
  const [impact, setImpact] = useState('');
  const [product, setProduct] = useState<Product>('DARTBoards');

  const dirty = !!(title || describe || impact || product !== 'DARTBoards');
  const ready = !!title.trim() && !!describe.trim();

  return (
    <FormShell
      id="ds-req-feature"
      crumb="Feature Request"
      title="Feature Request"
      Icon={Lightbulb}
      color="info"
      ready={ready}
      phase={phase}
      dirty={dirty}
      onSubmit={() =>
        submit({
          type: 'feature',
          product,
          title: title.trim(),
          summary: describe.trim(),
          fields: [
            { label: 'Title', value: title.trim() },
            { label: 'Application', value: PRODUCTS.find((p) => p.value === product)!.label },
            { label: 'Proposal', value: describe.trim() },
            ...(impact.trim() ? [{ label: 'Business impact', value: impact.trim() }] : []),
          ],
        })
      }
    >
      <div className="ds-requests-fields">
        <Alert
          id="ds-req-feature-note"
          description="Feature requests are reviewed by the DART Central admin team like any other request. Approved ones are published to the public feature backlog, where all users can upvote and track progress."
        />
        <Input
          id="ds-req-feature-title"
          label="Feature title"
          required
          description="One-line description of what you want."
          placeholder="e.g. Let me pin a dashboard to the top of Browse"
          value={title}
          onValueChange={setTitle}
        />
        <ProductSelect id="ds-req-feature-product" value={product} onChange={setProduct} />
        <Textarea
          id="ds-req-feature-describe"
          label="Describe the feature"
          required
          rows={4}
          description="What should it do? How should it work? Include any examples or context."
          placeholder="e.g. A pin control on each dashboard card, per person rather than per team."
          value={describe}
          onValueChange={setDescribe}
        />
        <Textarea
          id="ds-req-feature-impact"
          label="Business impact"
          rows={3}
          description="How would this improve your team’s workflow, reporting, or visibility?"
          placeholder="e.g. Saves about twenty people six clicks every morning."
          value={impact}
          onValueChange={setImpact}
        />
      </div>
    </FormShell>
  );
}
