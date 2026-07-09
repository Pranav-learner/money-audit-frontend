'use client';

import { Loader2, ScanLine, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Category } from '@/features/categories/api';
import { useConfirmReceipt, useUploadReceipt, type ReceiptUploadResponse } from '@/features/receipts/api';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FormItem, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from '@/shared/components/ui/toast';
import { todayIso } from '@/shared/utils/format';
import { env } from '@/shared/lib/env';
import type { ApiError } from '@/lib/api';

type Phase = 'select' | 'uploading' | 'review';

export interface ReceiptUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

function imageSrc(url: string): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `${env.apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function ReceiptUploadDialog({ open, onOpenChange, categories }: ReceiptUploadDialogProps) {
  const upload = useUploadReceipt();
  const confirm = useConfirmReceipt();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>('select');
  const [receipt, setReceipt] = useState<ReceiptUploadResponse | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIso());
  const [merchant, setMerchant] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const resetState = () => {
    setPhase('select');
    setReceipt(null);
    setAmount('');
    setDate(todayIso());
    setMerchant('');
    setCategoryId('');
  };

  const handleClose = (next: boolean) => {
    if (!next) resetState();
    onOpenChange(next);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setPhase('uploading');
    try {
      const result = await upload.mutateAsync(file);
      setReceipt(result);
      setAmount(result.amount ? String(result.amount) : '');
      setDate(result.date || todayIso());
      setMerchant(result.merchant || '');
      const match = categories.find((c) => c.name.toLowerCase() === (result.suggestedCategory || '').toLowerCase());
      setCategoryId(match?.id ?? '');
      setPhase('review');
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Could not read that receipt');
      setPhase('select');
    }
  };

  const handleConfirm = async () => {
    if (!receipt) return;
    if (!amount || Number(amount) <= 0 || !date) {
      toast.error('Please provide a valid amount and date');
      return;
    }
    try {
      await confirm.mutateAsync({
        id: receipt.id,
        data: { amount: Number(amount), date, merchant, categoryId: categoryId || undefined },
      });
      toast.success('Expense saved from receipt');
      handleClose(false);
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Failed to save expense');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Scan a receipt</DialogTitle>
          <DialogDescription>
            We&apos;ll extract the details — review and edit them before saving. Nothing is saved automatically.
          </DialogDescription>
        </DialogHeader>

        {phase === 'select' && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/40 px-6 py-12 text-center transition-colors hover:border-primary hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Upload className="size-6" aria-hidden />
            </span>
            <span className="text-sm font-medium text-foreground">Tap to upload a receipt image</span>
            <span className="text-xs text-muted-foreground">PNG or JPG, up to 10&nbsp;MB</span>
          </button>
        )}

        {phase === 'uploading' && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
            <p className="text-sm font-medium text-foreground">Reading your receipt…</p>
            <p className="text-xs text-muted-foreground">Extracting amount, date and merchant</p>
          </div>
        )}

        {phase === 'review' && receipt && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              <ScanLine className="size-4" aria-hidden />
              Details extracted — please confirm or edit below.
            </div>
            {receipt.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc(receipt.imageUrl)}
                alt="Uploaded receipt"
                className="max-h-40 w-full rounded-lg border border-border object-contain"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <FormItem>
                <FormLabel htmlFor="ocr-amount">Amount (₹)</FormLabel>
                <Input id="ocr-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </FormItem>
              <FormItem>
                <FormLabel htmlFor="ocr-date">Date</FormLabel>
                <Input id="ocr-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </FormItem>
            </div>
            <FormItem>
              <FormLabel htmlFor="ocr-merchant">Merchant</FormLabel>
              <Input id="ocr-merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Merchant / description" />
            </FormItem>
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {(c.icon || '📁') + ' ' + c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          {phase === 'review' && (
            <Button onClick={handleConfirm} loading={confirm.isPending}>
              Save expense
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
