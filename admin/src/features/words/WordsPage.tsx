import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AddWordDialog } from './AddWordDialog';

export function WordsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Words</h1>
          <p className="text-muted-foreground text-sm">
            Manage dictionary entries.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Add word
        </Button>
      </div>

      <Card>
        <CardContent className="text-muted-foreground py-12 text-center text-sm">
          No words yet — add your first word.
        </CardContent>
      </Card>

      <AddWordDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
