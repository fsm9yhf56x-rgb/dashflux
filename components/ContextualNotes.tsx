'use client';

import { useState, useEffect } from 'react';
import { AssetScore } from '@/lib/types';
import { Brain, AlertTriangle, CheckCircle, MessageSquare, Save, Edit2 } from 'lucide-react';

interface Props {
  asset: AssetScore;
  regime: string;
}

export default function ContextualNotes({ asset, regime }: Props) {
  const [userNote, setUserNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Charger la note depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`note-${asset.ticker}`);
    if (stored) {
      setUserNote(stored);
    }
  }, [asset.ticker]);

  const saveNote = () => {
    localStorage.setItem(`note-${asset.ticker}`, userNote);
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  // Contexte automatique
  const getContextualWarnings = () => {
    const warnings = [];
    
    // Vérifier divergence score actuel vs émergent
    const gap = Math.abs(asset.score - asset.emergentScore);
    if (gap > 20) {
      if (asset.emergentScore > asset.score) {
        warnings.push({
          type: 'info',
          text: `Score émergent bien supérieur (${asset.emergentScore} vs ${asset.score}) - Signal précoce positif`
        });
      } else {
        warnings.push({
          type: 'warning',
          text: `Score actuel supérieur au score émergent - Momentum pourrait faiblir`
        });
      }
    }

    // Vérifier cohérence avec régime macro
    const regimeFavors = checkRegimeFit(asset.category, regime);
    if (regimeFavors === 'favorable') {
      warnings.push({
        type: 'success',
        text: `Régime macro ${regime} favorable pour ${asset.category}`
      });
    } else if (regimeFavors === 'unfavorable') {
      warnings.push({
        type: 'warning',
        text: `Régime macro ${regime} généralement défavorable pour ${asset.category}`
      });
    }

    // Vérifier recommandation vs scores
    if (asset.recommendation === 'ACCUMULATE' && asset.emergentScore < 75) {
      warnings.push({
        type: 'info',
        text: 'Recommandation ACCUMULATE malgré score émergent modéré - Vérifier catalyseurs'
      });
    }

    return warnings;
  };

  const checkRegimeFit = (category: string, regime: string): 'favorable' | 'unfavorable' | 'neutral' => {
    const matrix: Record<string, Record<string, string>> = {
      'goldilocks': {
        'equity': 'favorable',
        'crypto': 'favorable',
        'commodity': 'neutral',
        'bond': 'unfavorable'
      },
      'reflation': {
        'commodity': 'favorable',
        'equity': 'neutral',
        'bond': 'unfavorable'
      },
      'stagflation': {
        'commodity': 'favorable',
        'bond': 'neutral',
        'equity': 'unfavorable'
      },
      'recession': {
        'bond': 'favorable',
        'currency': 'favorable',
        'equity': 'unfavorable'
      }
    };

    return (matrix[regime.toLowerCase()]?.[category] || 'neutral') as 'favorable' | 'unfavorable' | 'neutral';
  };

  const warnings = getContextualWarnings();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-purple-200 dark:border-purple-900">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Contexte & Analyse Humaine
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Le dashboard donne les signaux, vous apportez le contexte
          </p>
        </div>
      </div>

      {/* Score Dashboard */}
      <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            📊 Signal DashFlux
          </span>
          <div className="flex gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Actuel</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{asset.score.toFixed(1)}</div>
            </div>
            <div className="text-center px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded">
              <div className="text-xs text-purple-700 dark:text-purple-300">Émergent</div>
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{asset.emergentScore.toFixed(1)}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            asset.recommendation === 'ACCUMULATE' ? 'bg-green-500 text-white' :
            asset.recommendation === 'WATCH' ? 'bg-blue-500 text-white' :
            asset.recommendation === 'HOLD' ? 'bg-gray-500 text-white' :
            asset.recommendation === 'TRIM' ? 'bg-orange-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {asset.recommendation}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Score Composite: {((asset.score * 0.4) + (asset.emergentScore * 0.6)).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Contexte Automatique */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          🧠 Contexte à Considérer
        </h4>
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border text-sm ${
                warning.type === 'warning' 
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300'
                : warning.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
              }`}
            >
              {warning.type === 'warning' && '⚠️ '}
              {warning.type === 'success' && '✅ '}
              {warning.type === 'info' && 'ℹ️ '}
              {warning.text}
            </div>
          ))}
          {warnings.length === 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              ✅ Pas d'alerte contextuelle majeure détectée
            </div>
          )}
        </div>
      </div>

      {/* Note Personnelle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            📝 Votre Note Perso
          </h4>
          {!isEditing && userNote && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              <Edit2 className="w-3 h-3" />
              Modifier
            </button>
          )}
        </div>
        
        {isEditing || !userNote ? (
          <div>
            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Ex: J'entre à 50% position maintenant, 50% si DXY casse 103. Stop loss à -3%. Surveiller Fed meeting dans 2 semaines..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm min-h-[100px]"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={saveNote}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
              {userNote && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    const stored = localStorage.getItem(`note-${asset.ticker}`);
                    if (stored) setUserNote(stored);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Annuler
                </button>
              )}
            </div>
            {saved && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                Note sauvegardée !
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {userNote}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 <strong>Rappel:</strong> DashFlux fait 70-80% du travail automatiquement. 
          Les 20-30% restants ? C'est vous. Le dashboard donne les signaux objectifs, 
          vous apportez le contexte et le jugement. Ensemble = décisions éclairées.
        </p>
      </div>
    </div>
  );
}