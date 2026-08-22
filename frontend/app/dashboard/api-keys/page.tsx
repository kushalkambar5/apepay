'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { apiKeysApi } from '@/lib/api/api-keys';
import { ApiKey } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/formatters';
import { Plus, Key, Copy, Check, Trash2 } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [keyName, setKeyName] = useState<string>('Production Key');
  const [environment, setEnvironment] = useState<'test' | 'live'>('live');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await apiKeysApi.listKeys();
      setKeys(res.keys || []);
    } catch (err) {
      console.error('Failed to fetch API keys', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const newKey = await apiKeysApi.createKey({ name: keyName, environment });
      setIsCreateOpen(false);
      setCreatedKey(newKey.key || newKey.keyPrefix || 'ape_key_created');
      fetchKeys();
    } catch (err: any) {
      setError(err?.message || 'Failed to create API key');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using it will lose access.')) return;
    try {
      await apiKeysApi.revokeKey(keyId);
      fetchKeys();
    } catch (err) {
      console.error('Failed to revoke API key', err);
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <Header title="API Keys" />

      <div className="px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#171717]">Developer API Keys</h2>
            <p className="text-xs text-[#888888]">
              Manage API keys for server-side payment session creation.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} variant="primary" size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>Create key</span>
          </Button>
        </div>

        {/* API Keys Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key Prefix</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-[#888888]">
                  No API keys generated yet. Click &quot;Create key&quot; above to issue one.
                </TableCell>
              </TableRow>
            ) : (
              keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium text-[#171717]">{key.name}</TableCell>
                  <TableCell className="font-mono text-xs text-[#4d4d4d]">
                    {key.keyPrefix || 'ape_...'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={key.environment === 'live' ? 'default' : 'neutral'}>
                      {key.environment}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[#888888]">
                    {formatDate(key.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs text-[#888888]">
                    {key.lastUsedAt ? formatRelativeTime(key.lastUsedAt) : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      className="text-[#ee0000] hover:text-[#c50000] p-1 transition-colors"
                      title="Revoke key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Create Dialog Modal */}
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create API Key"
          description="Issue a secret API key for creating payments programmatically."
        >
          <form onSubmit={handleCreateKey} className="space-y-4">
            {error && (
              <div className="rounded-md bg-[#ee0000]/10 border border-[#ee0000]/20 p-3 text-xs text-[#ee0000]">
                {error}
              </div>
            )}

            <Input
              label="Key Name"
              placeholder="Production Backend Key"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-[#4d4d4d]">
                Environment
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                  <input
                    type="radio"
                    name="env"
                    checked={environment === 'test'}
                    onChange={() => setEnvironment('test')}
                  />
                  <span>Test</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                  <input
                    type="radio"
                    name="env"
                    checked={environment === 'live'}
                    onChange={() => setEnvironment('live')}
                  />
                  <span>Live</span>
                </label>
              </div>
            </div>

            <Button type="submit" isLoading={submitting} className="w-full">
              Create
            </Button>
          </form>
        </Modal>

        {/* Key Display Modal */}
        <Modal
          isOpen={!!createdKey}
          onClose={() => setCreatedKey(null)}
          title="API Key Created"
          description="Copy your API key now. ApePay will not display it again."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-[#ebebeb] bg-[#171717] p-3 text-white font-mono text-xs">
              <Key className="h-4 w-4 text-[#0070f3] shrink-0" />
              <span className="flex-1 truncate">{createdKey}</span>
              <button
                onClick={handleCopyKey}
                className="p-1 rounded hover:bg-white/20 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <Button onClick={() => setCreatedKey(null)} className="w-full">
              Done
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
