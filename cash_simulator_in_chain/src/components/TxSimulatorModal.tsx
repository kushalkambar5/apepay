import React, { useState } from 'react';
import { WalletNode } from '../types/bubble';
import { shortenAddress, formatNumber } from '../utils/formatters';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react';

interface TxSimulatorModalProps {
  nodes: WalletNode[];
  onExecuteTx: (senderId: string, receiverId: string, amount: number) => void;
  onClose: () => void;
}

export const TxSimulatorModal: React.FC<TxSimulatorModalProps> = ({
  nodes,
  onExecuteTx,
  onClose
}) => {
  const [senderId, setSenderId] = useState(nodes[0]?.id || '');
  const [receiverId, setReceiverId] = useState(nodes[1]?.id || '');
  const [amount, setAmount] = useState<number>(500000);
  const [error, setError] = useState<string | null>(null);

  const senderNode = nodes.find(n => n.id === senderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderId || !receiverId) {
      setError('Please select both sender and receiver wallets.');
      return;
    }
    if (senderId === receiverId) {
      setError('Sender and receiver must be different wallets.');
      return;
    }
    if (!amount || amount <= 0) {
      setError('Transfer amount must be greater than 0.');
      return;
    }
    if (senderNode && amount > senderNode.balance) {
      setError(`Sender balance insufficient (Max: ${formatNumber(senderNode.balance)}).`);
      return;
    }

    onExecuteTx(senderId, receiverId, amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">On-Chain Tx Simulator</h2>
              <p className="text-[11px] text-slate-400">Simulate wallet fund transfers live</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sender Select */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Sender Wallet Address
            </label>
            <select
              value={senderId}
              onChange={e => {
                setSenderId(e.target.value);
                setError(null);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.label ? `${n.label} (${shortenAddress(n.id, 4)})` : n.id} — Bal: {formatNumber(n.balance)}
                </option>
              ))}
            </select>
          </div>

          {/* Receiver Select */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Receiver Wallet Address
            </label>
            <select
              value={receiverId}
              onChange={e => {
                setReceiverId(e.target.value);
                setError(null);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.label ? `${n.label} (${shortenAddress(n.id, 4)})` : n.id} — Bal: {formatNumber(n.balance)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Transfer Token Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => {
                setAmount(parseFloat(e.target.value) || 0);
                setError(null);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              placeholder="Enter transfer amount"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/20 transition"
            >
              Broadcast Transfer & Update Graph
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
