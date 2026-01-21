"use client";

import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface RequestCancellationModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
}

export function RequestCancellationModal({ isOpen, onClose, requestId }: RequestCancellationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertTriangle className="h-6 w-6" />
                        <DialogTitle>Cancel Service Request?</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to cancel request <strong>{requestId}</strong>? <br />
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-red-50 p-4 border border-red-100 text-sm text-red-800">
                        <strong>Warning:</strong> Any appointments scheduled with this request will be automatically cancelled.
                    </div>
                    <Textarea
                        placeholder="Reason for cancellation (Required)..."
                        className="bg-slate-50 min-h-[100px]"
                    />
                </div>

                <DialogFooter className="flex gap-2 sm:justify-end">
                    <Button variant="ghost" onClick={onClose}>Go Back</Button>
                    <Button variant="destructive">Confirm Cancellation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
