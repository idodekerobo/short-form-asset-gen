'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { type Duration, type Resolution } from '@/types';

const DURATIONS: readonly Duration[] = [5, 10, 15] as const;
const RESOLUTIONS: readonly Resolution[] = ['720P', '1080P'] as const;

interface SettingsPanelProps {
  duration: Duration;
  resolution: Resolution;
  onDurationChange: (duration: Duration) => void;
  onResolutionChange: (resolution: Resolution) => void;
}

export function SettingsPanel({
  duration,
  resolution,
  onDurationChange,
  onResolutionChange,
}: SettingsPanelProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="settings">
        <AccordionTrigger>Advanced Settings</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6 pt-4">
            <div>
              <Label className="text-base">Duration</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Choose video length in seconds
              </p>
              <div className="flex gap-2">
                {DURATIONS.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={duration === value ? 'default' : 'outline'}
                    onClick={() => onDurationChange(value)}
                    className="flex-1"
                  >
                    {value}s
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base">Resolution</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Higher resolution = better quality but slower generation
              </p>
              <div className="flex gap-2">
                {RESOLUTIONS.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={resolution === value ? 'default' : 'outline'}
                    onClick={() => onResolutionChange(value)}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
