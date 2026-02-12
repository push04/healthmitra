'use client';

import { useState, useEffect } from 'react';
import { MediaItem, MediaFolder } from '@/app/lib/mock/cms-data';
import { getMedia, uploadFile, createFolder } from '@/app/actions/cms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Folder, Image as ImageIcon, FileText, Video, UploadCloud, Plus, MoreVertical, Search, Download, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function MediaPage() {
    const [items, setItems] = useState<{ files: MediaItem[], folders: MediaFolder[] }>({ files: [], folders: [] });
    const [currentFolder, setCurrentFolder] = useState<string>('root');
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const res = await getMedia(currentFolder);
        if (res.success && res.data) setItems(res.data);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, [currentFolder]);

    const handleUpload = async () => {
        toast.loading("Uploading...");
        await uploadFile(new FormData());
        toast.dismiss();
        toast.success("File uploaded");
        loadData();
    };

    const handleCreateFolder = async () => {
        const name = prompt("Folder Name:");
        if (name) {
            await createFolder(name);
            toast.success("Folder created");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'image': return <ImageIcon className="h-8 w-8 text-purple-400" />;
            case 'video': return <Video className="h-8 w-8 text-pink-400" />;
            case 'document': return <FileText className="h-8 w-8 text-blue-400" />;
            default: return <FileText className="h-8 w-8 text-zinc-400" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {currentFolder !== 'root' && (
                        <Button variant="ghost" size="icon" onClick={() => setCurrentFolder('root')} className="hover:bg-slate-100 text-slate-600"><ArrowLeft className="h-4 w-4" /></Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            Media Library {currentFolder !== 'root' && <span className="text-slate-400 text-lg font-normal">/ {items.folders.find(f => f.id === currentFolder)?.name || currentFolder}</span>}
                        </h1>
                        <p className="text-slate-500 text-sm">Manage images and documents.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={handleCreateFolder}>
                        <Plus className="mr-2 h-4 w-4" /> New Folder
                    </Button>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleUpload}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* FOLDERS */}
                {items.folders.map(folder => (
                    <Card key={folder.id} className="bg-white border-slate-200 hover:bg-slate-50 hover:border-teal-200 hover:shadow-md cursor-pointer transition-all shadow-sm" onClick={() => setCurrentFolder(folder.id)}>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-40 gap-2">
                            <Folder className="h-12 w-12 text-teal-400 fill-teal-50" />
                            <div className="font-medium text-slate-800 text-sm truncate w-full">{folder.name}</div>
                            <div className="text-xs text-slate-400">{folder.itemCount} items</div>
                        </CardContent>
                    </Card>
                ))}

                {/* FILES */}
                {items.files.map(file => (
                    <Card key={file.id} className="bg-white border-slate-200 hover:border-teal-200 hover:shadow-md group relative shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-40 gap-2">
                            {getIcon(file.type)}
                            <div className="font-medium text-slate-800 text-sm truncate w-full">{file.name}</div>
                            <div className="text-xs text-slate-400">{file.size}</div>
                        </CardContent>

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl border border-teal-200">
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200" onClick={() => toast.success(`Downloading ${file.name}`)}><Download className="h-4 w-4" /></Button>
                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100" onClick={() => toast.success(`${file.name} deleted`)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </Card>
                ))}
            </div>

            {items.files.length === 0 && items.folders.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <div className="p-4 rounded-full bg-slate-50 inline-block mb-4 border border-slate-100"><UploadCloud className="h-8 w-8 text-slate-300" /></div>
                    <p>Folder is empty.</p>
                </div>
            )}
        </div>
    );
}
