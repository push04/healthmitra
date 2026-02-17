'use client';

import { useState, useEffect } from 'react';
import { City, INDIAN_STATES, Region } from '@/types/locations';
import { getCities, upsertCity, deleteCity, searchPincode, bulkUploadCities } from '@/app/actions/locations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search, Edit2, Trash2, MapPin, UploadCloud, X, Loader2, FileSpreadsheet, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function LocationsPage() {
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stateFilter, setStateFilter] = useState('all');
    const [regionFilter, setRegionFilter] = useState('all');

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<Partial<City>>({});

    // Pincode Search Tool state
    const [pincodeQuery, setPincodeQuery] = useState('');
    const [pincodeResult, setPincodeResult] = useState<any>(null);
    const [searchingPincode, setSearchingPincode] = useState(false);

    const loadCities = async () => {
        setLoading(true);
        const res = await getCities({
            query: search,
            state: stateFilter,
            region: regionFilter as Region | 'all'
        });
        if (res.success) setCities(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        const timeout = setTimeout(loadCities, 300);
        return () => clearTimeout(timeout);
    }, [search, stateFilter, regionFilter]);

    // Format pincodes map
    const newPincode = useState('');

    const handleSaveCity = async () => {
        if (!editingCity.name || !editingCity.state) {
            toast.error("City name and state are required");
            return;
        }
        await upsertCity(editingCity);
        setIsAddOpen(false);
        setEditingCity({});
        loadCities();
        toast.success("City saved successfully");
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this city?')) {
            await deleteCity(id);
            loadCities();
            toast.success("City deleted");
        }
    };

    const handlePincodeSearch = async () => {
        if (!pincodeQuery || pincodeQuery.length < 6) {
            toast.error("Enter valid 6-digit pincode");
            return;
        }
        setSearchingPincode(true);
        const res = await searchPincode(pincodeQuery);
        setPincodeResult(res);
        setSearchingPincode(false);
    };

    const handleBulkUpload = async () => {
        toast.loading("Uploading and processing file...");
        await bulkUploadCities(Array(15).fill({})); // sim 15 entries
        setIsUploadOpen(false);
        toast.dismiss();
        toast.success("Bulk upload processed successfully");
        loadCities();
    };

    // Pincode Managment inside Modal
    const [tempPincode, setTempPincode] = useState('');
    const addPincode = () => {
        if (tempPincode.length === 6) {
            setEditingCity(prev => ({
                ...prev,
                pincodes: [...(prev.pincodes || []), tempPincode]
            }));
            setTempPincode('');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Location Master
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage serviceable cities, pincodes, and regions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-teal-600 text-teal-400 hover:bg-teal-900/10" onClick={() => setIsUploadOpen(true)}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Bulk Upload
                    </Button>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => { setEditingCity({ isServiceable: true, status: 'active', pincodes: [] }); setIsAddOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add City
                    </Button>
                </div>
            </div>

            {/* Pincode Search Tool */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><Search className="h-4 w-4" /> Quick Pincode Lookup</CardTitle></CardHeader>
                <CardContent className="flex gap-4 items-start">
                    <div className="flex gap-2 flex-1 max-w-md">
                        <Input
                            placeholder="Enter 6-digit Pincode"
                            value={pincodeQuery}
                            onChange={(e) => setPincodeQuery(e.target.value)}
                            className="bg-white border-slate-200 text-slate-900"
                            maxLength={6}
                        />
                        <Button variant="secondary" onClick={handlePincodeSearch} disabled={searchingPincode} className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                            {searchingPincode ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
                        </Button>
                    </div>
                    {pincodeResult && (
                        <div className={`flex-1 p-3 rounded-lg border ${pincodeResult.found ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'} flex items-center gap-4`}>
                            {pincodeResult.found ? (
                                <>
                                    <CheckCircle className="h-5 w-5 text-teal-600" />
                                    <div>
                                        <div className="text-sm font-bold text-teal-700">Serviceable Location</div>
                                        <div className="text-xs text-slate-500">
                                            {pincodeResult.data.city}, {pincodeResult.data.state} ({pincodeResult.data.region})
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <div>
                                        <div className="text-sm font-bold text-red-700">Not Serviceable</div>
                                        <div className="text-xs text-slate-500">This pincode is not mapped to any active city.</div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search City or Pincode..."
                        className="pl-9 bg-white border-slate-200 text-slate-900"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger className="w-[200px] bg-white border-slate-200 text-slate-700"><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                        <SelectItem value="all">All States</SelectItem>
                        {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-[150px] bg-white border-slate-200 text-slate-700"><SelectValue placeholder="Region" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                        <SelectItem value="all">All Regions</SelectItem>
                        {['North', 'South', 'East', 'West', 'Central'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="border-slate-200 hover:bg-transparent">
                            <TableHead className="text-slate-700">City Name</TableHead>
                            <TableHead className="text-slate-700">State</TableHead>
                            <TableHead className="text-slate-700">Pincodes</TableHead>
                            <TableHead className="text-slate-700">Region</TableHead>
                            <TableHead className="text-slate-700">Status</TableHead>
                            <TableHead className="text-right text-slate-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cities.map(city => (
                            <TableRow key={city.id} className="border-slate-100 hover:bg-slate-50">
                                <TableCell className="font-medium text-slate-900">{city.name}</TableCell>
                                <TableCell className="text-slate-600">{city.state}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {city.pincodes.slice(0, 3).map(p => (
                                            <Badge key={p} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] border border-slate-200">{p}</Badge>
                                        ))}
                                        {city.pincodes.length > 3 && <span className="text-xs text-slate-500">+{city.pincodes.length - 3} more</span>}
                                    </div>
                                </TableCell>
                                <TableCell><Badge variant="outline" className="border-slate-300 text-slate-600">{city.region}</Badge></TableCell>
                                <TableCell>
                                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${city.isServiceable ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                        {city.isServiceable ? 'Serviceable' : 'Inactive'}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => { setEditingCity(city); setIsAddOpen(true); }}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(city.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* ADD CITy MODAL */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingCity.id ? 'Edit City' : 'Add New City'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>City Name *</Label>
                            <Input value={editingCity.name || ''} onChange={e => setEditingCity(prev => ({ ...prev, name: e.target.value }))} className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <Label>State *</Label>
                            <Select value={editingCity.state} onValueChange={v => setEditingCity(prev => ({ ...prev, state: v }))}>
                                <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Select State" /></SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-700 h-[200px]">
                                    {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Region (Auto-filled)</Label>
                            <Select value={editingCity.region || 'West'} onValueChange={v => setEditingCity(prev => ({ ...prev, region: v as Region }))}>
                                <SelectTrigger className="bg-white border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-700">
                                    {['North', 'South', 'East', 'West', 'Central'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Serviceable Status</Label>
                            <Select value={editingCity.isServiceable ? 'yes' : 'no'} onValueChange={v => setEditingCity(prev => ({ ...prev, isServiceable: v === 'yes' }))}>
                                <SelectTrigger className="bg-white border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-700">
                                    <SelectItem value="yes">Yes - Serviceable</SelectItem>
                                    <SelectItem value="no">No - Not Serviceable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-4 mt-2">
                        <Label>Pincodes</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add 6-digit Pincode"
                                value={tempPincode}
                                onChange={e => setTempPincode(e.target.value)}
                                maxLength={6}
                                className="bg-white border-slate-200"
                            />
                            <Button size="sm" onClick={addPincode} disabled={tempPincode.length !== 6}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 bg-slate-50 p-2 rounded border border-slate-200 min-h-[60px]">
                            {editingCity.pincodes?.map(p => (
                                <Badge key={p} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-white border border-slate-200 text-slate-700">
                                    {p}
                                    <X className="h-3 w-3 cursor-pointer hover:text-red-600" onClick={() => setEditingCity(prev => ({ ...prev, pincodes: prev.pincodes?.filter(pi => pi !== p) }))} />
                                </Badge>
                            ))}
                            {(!editingCity.pincodes || editingCity.pincodes.length === 0) && <span className="text-slate-400 text-sm italic p-1">No pincodes added yet.</span>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSaveCity}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* BULK UPLOAD MODAL */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900">
                    <DialogHeader>
                        <DialogTitle>Bulk Upload Locations</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="border border-dashed border-teal-500/30 bg-teal-50 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                            <FileSpreadsheet className="h-12 w-12 text-teal-600 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">Upload Excel File</h3>
                            <p className="text-sm text-slate-500 mb-4">Drag and drop or browse to upload .xlsx file</p>
                            <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                                Select File
                            </Button>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded border border-slate-100"><Download className="h-4 w-4 text-slate-600" /></div>
                                <div className="text-sm">
                                    <div className="font-medium text-slate-900">Download Template</div>
                                    <div className="text-slate-500">Use this for correct formatting</div>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost">Download</Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleBulkUpload}>Upload & Process</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
