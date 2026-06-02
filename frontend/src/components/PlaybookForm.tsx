'use client';

import { useState } from 'react';

interface PlaybookFormProps {
    suggestion: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

export default function PlaybookForm({ suggestion, onSave, onCancel }: PlaybookFormProps) {
    const [formData, setFormData] = useState({
        playbookName: suggestion.name || '',
        description: suggestion.description || '',
        steps: suggestion.steps || [],
        triggerConditions: suggestion.triggerConditions || { eventTypes: [], sources: [] },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const addStep = () => {
        setFormData({
            ...formData,
            steps: [
                ...formData.steps,
                { type: 'http_request', name: 'New Step', config: { method: 'POST', url: '' } },
            ],
        });
    };

    const removeStep = (index: number) => {
        setFormData({
            ...formData,
            steps: formData.steps.filter((_: any, i: number) => i !== index),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Playbook Name */}
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Playbook Name
                </label>
                <input
                    type="text"
                    value={formData.playbookName}
                    onChange={(e) => setFormData({ ...formData, playbookName: e.target.value })}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white font-sans text-sm rounded-xl focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-slate-600"
                    placeholder="e.g., Restart Database Connection Pool"
                    required
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white font-sans text-sm rounded-xl focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-slate-600 resize-y"
                    placeholder="What does this playbook do?"
                    required
                />
            </div>

            {/* Trigger Conditions */}
            <div className="bg-black/20 rounded-xl p-5 border border-white/10">
                <h4 className="font-bold text-white mb-4 uppercase tracking-wide text-sm">Trigger Conditions</h4>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        Event Types (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={formData.triggerConditions.eventTypes.join(', ')}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                triggerConditions: {
                                    ...formData.triggerConditions,
                                    eventTypes: e.target.value.split(',').map((s) => s.trim()),
                                },
                            })
                        }
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white font-sans text-sm rounded-xl focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-slate-600"
                        placeholder="e.g., database_error, connection_timeout"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        Sources (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={formData.triggerConditions.sources?.join(', ') || ''}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                triggerConditions: {
                                    ...formData.triggerConditions,
                                    sources: e.target.value.split(',').map((s) => s.trim()),
                                },
                            })
                        }
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white font-sans text-sm rounded-xl focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-slate-600"
                        placeholder="e.g., api-service-prod, database-prod"
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="bg-black/20 rounded-xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white uppercase tracking-wide text-sm">Remediation Steps</h4>
                    <button
                        type="button"
                        onClick={addStep}
                        className="px-4 py-2 text-xs font-bold tracking-wide uppercase bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/40 border border-purple-500/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    >
                        + Add Step
                    </button>
                </div>

                <div className="space-y-4">
                    {formData.steps.map((step: any, index: number) => (
                        <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step {index + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => removeStep(index)}
                                    className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    Remove
                                </button>
                            </div>

                            <input
                                type="text"
                                value={step.name}
                                onChange={(e) => {
                                    const newSteps = [...formData.steps];
                                    newSteps[index] = { ...step, name: e.target.value };
                                    setFormData({ ...formData, steps: newSteps });
                                }}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white font-sans text-sm rounded-xl focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-slate-600 mb-2"
                                placeholder="Step name"
                            />

                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2">
                                Type: <span className="text-white">{step.type}</span>
                            </div>
                        </div>
                    ))}

                    {formData.steps.length === 0 && (
                        <div className="bg-black/20 border border-white/5 rounded-xl p-6 text-center">
                            <p className="text-sm font-medium text-slate-500 tracking-wide">
                                NO FIX STEPS RECORDED. CLICK "ADD STEP" TO DEFINE REQUIRED OPERATIONS.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
                <button
                    type="submit"
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all flex justify-center items-center gap-2 tracking-wide"
                >
                    SAVE PLAYBOOK
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-all tracking-wide"
                >
                    CANCEL
                </button>
            </div>
        </form>
    );
}