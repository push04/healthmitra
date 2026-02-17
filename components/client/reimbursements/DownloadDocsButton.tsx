'use client';

import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export default function DownloadDocsButton({ count }: { count: number }) {
    return (
        <Button
            className="w-full"
            variant="secondary"
            onClick={() => toast.success('Download started', { description: 'Documents will be saved to your Downloads folder.' })}
        >
            <Download size={16} className="mr-2" /> Download All Docs
        </Button>
    );
}
