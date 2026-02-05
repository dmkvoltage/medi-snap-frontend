'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Search, FileText, Download, Trash2, Loader2, LogOut, FileSpreadsheet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { getInterpretations, deleteInterpretation, downloadExport, InterpretationResponse } from '@/lib/api-client';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<InterpretationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInterpretations({ search, type: typeFilter, page });
      setData(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?message=Please sign in to access your dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interpretation?')) return;
    try {
      await deleteInterpretation(id);
      fetchData(); // Refresh
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleExport = async (id: string, format: 'pdf' | 'csv' | 'excel') => {
    try {
      await downloadExport(id, format);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  if (authLoading || !isAuthenticated) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analysis History</h1>
            <p className="text-muted-foreground">Welcome back, {user?.full_name || user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/recent">
              <Button variant="outline">Recent Results</Button>
            </Link>
            <Link href="/upload">
              <Button variant="outline">New Analysis</Button>
            </Link>
            <Button variant="ghost" onClick={logout} className="text-destructive hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interpretations..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Lab Results">Lab Results</SelectItem>
              <SelectItem value="Prescription">Prescription</SelectItem>
              <SelectItem value="Medical Report">Medical Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No interpretations found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/interpret/${item.id}`)}
                    >
                      <TableCell className="whitespace-nowrap">
                        {item.created_at ? format(new Date(item.created_at), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.document_type || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={item.interpretation?.summary || 'No summary'}>
                        {item.interpretation?.summary || 'No summary available'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.confidence && item.confidence > 0.8 ? 'default' : 'destructive'}>
                          {item.confidence ? Math.round(item.confidence * 100) : 0}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleExport(item.id, 'pdf')} title="Export PDF">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleExport(item.id, 'excel')} title="Export Excel">
                            <FileSpreadsheet className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleExport(item.id, 'csv')} title="Export CSV">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              disabled={page >= pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
