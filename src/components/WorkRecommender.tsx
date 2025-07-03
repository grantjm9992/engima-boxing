import React, { useState } from 'react';
import { 
  Lightbulb, X, Target, Zap, Brain, Flag, 
  CheckCircle, AlertTriangle, Plus, ArrowRight,
  Calendar, Clock, BarChart3, Filter, Search
} from 'lucide-react';
import { WorkTypeGoal } from './GoalsManager';
import { BlockTemplate } from './BlockLibrary';
import { Goal } from './GoalsManager';

interface RecommendationItem {
  id: string;
  type: 'block' | 'exercise' | 'workType';
  name: string;
  description: string;
  confidence: number; // 0-100
  reason: string;
  workTypeId?: string;
  blockId?: string;
  exerciseId?: string;
}

interface WorkRecommenderProps {
  goals: Goal[];
  workTypes: WorkTypeGoal[];
  blockTemplates: BlockTemplate[];
  completedWorkTypes: string[]; // IDs of work types already completed
  onSelectRecommendation: (recommendation: RecommendationItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const WorkRecommender: React.FC<WorkRecommenderProps> = ({
  goals,
  workTypes,
  blockTemplates,
  completedWorkTypes,
  onSelectRecommendation,
  isOpen,
  onClose
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [filterConfidence, setFilterConfidence] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Generate recommendations based on selected goal and completed work types
  const getRecommendations = (): RecommendationItem[] => {
    if (!selectedGoal) return [];
    
    const goal = goals.find(g => g.id === selectedGoal);
    if (!goal) return [];
    
    const recommendations: RecommendationItem[] = [];
    
    // 1. Recommend missing work types
    const missingWorkTypes = goal.workTypes.filter(wtId => !completedWorkTypes.includes(wtId));
    
    missingWorkTypes.forEach(workTypeId => {
      const workType = workTypes.find(wt => wt.id === workTypeId);
      if (workType) {
        recommendations.push({
          id: `rec_wt_${workType.id}`,
          type: 'workType',
          name: workType.name,
          description: workType.description,
          confidence: 95,
          reason: 'Tipo de trabajo requerido por el objetivo y aún no completado',
          workTypeId: workType.id
        });
      }
    });
    
    // 2. Recommend blocks that match the missing work types
    missingWorkTypes.forEach(workTypeId => {
      const matchingBlocks = blockTemplates.filter(block => 
        block.tags.some(tag => {
          const workType = workTypes.find(wt => wt.id === workTypeId);
          return workType && tag.toLowerCase().includes(workType.name.toLowerCase());
        })
      );
      
      matchingBlocks.forEach(block => {
        recommendations.push({
          id: `rec_block_${block.id}`,
          type: 'block',
          name: block.name,
          description: block.description,
          confidence: 85,
          reason: `Bloque compatible con tipo de trabajo "${workTypes.find(wt => wt.id === workTypeId)?.name}"`,
          workTypeId,
          blockId: block.id
        });
      });
    });
    
    // 3. Add some variety with lower confidence recommendations
    const otherWorkTypes = workTypes.filter(wt => 
      !goal.workTypes.includes(wt.id) && 
      !completedWorkTypes.includes(wt.id)
    );
    
    otherWorkTypes.slice(0, 3).forEach(workType => {
      recommendations.push({
        id: `rec_variety_${workType.id}`,
        type: 'workType',
        name: workType.name,
        description: workType.description,
        confidence: 60,
        reason: 'Añade variedad al entrenamiento',
        workTypeId: workType.id
      });
    });
    
    return recommendations;
  };

  // Filter recommendations
  const filteredRecommendations = getRecommendations()
    .filter(rec => 
      rec.confidence >= filterConfidence &&
      (searchTerm === '' || 
        rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.confidence - a.confidence);

  const getWorkTypeCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical': return Zap;
      case 'technical': return Target;
      case 'mental': return Brain;
      case 'tactical': return Flag;
      default: return Target;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 70) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getGoalProgress = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return 0;
    
    const completedCount = goal.workTypes.filter(wtId => completedWorkTypes.includes(wtId)).length;
    return goal.workTypes.length > 0 ? (completedCount / goal.workTypes.length) * 100 : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Recomendador Inteligente</h1>
                <p className="text-blue-100">Sugerencias basadas en objetivos y progreso</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{goals.filter(g => g.isActive).length} objetivos activos</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>{completedWorkTypes.length} tipos de trabajo completados</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(90vh-140px)]">
          {/* Goals Selection */}
          <div className="border-r border-gray-200 dark:border-dark-border overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Selecciona un Objetivo
              </h3>
              
              <div className="space-y-3">
                {goals.filter(g => g.isActive).map((goal) => {
                  const progress = getGoalProgress(goal.id);
                  
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedGoal === goal.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-dark-border hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{goal.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                          {goal.type}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {goal.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>Progreso</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </button>
                  );
                })}

                {goals.filter(g => g.isActive).length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No hay objetivos activos</p>
                    <p className="text-sm">Crea objetivos para recibir recomendaciones</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="col-span-2 overflow-y-auto">
            <div className="p-6">
              {selectedGoal ? (
                <>
                  {/* Selected Goal Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Recomendaciones para: {goals.find(g => g.id === selectedGoal)?.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {goals.find(g => g.id === selectedGoal)?.description}
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Buscar recomendaciones..."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Confianza mínima:</span>
                      <select
                        value={filterConfidence}
                        onChange={(e) => setFilterConfidence(parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                      >
                        <option value="0">Todas</option>
                        <option value="50">50%+</option>
                        <option value="70">70%+</option>
                        <option value="90">90%+</option>
                      </select>
                    </div>
                  </div>

                  {/* Recommendations List */}
                  {filteredRecommendations.length > 0 ? (
                    <div className="space-y-4">
                      {filteredRecommendations.map((recommendation) => {
                        const workType = recommendation.workTypeId 
                          ? workTypes.find(wt => wt.id === recommendation.workTypeId)
                          : null;
                        
                        return (
                          <div 
                            key={recommendation.id} 
                            className="p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md dark:hover:shadow-dark transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                {workType && (
                                  <div 
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                                    style={{ backgroundColor: workType.color }}
                                  >
                                    {React.createElement(
                                      getWorkTypeCategoryIcon(workType.category),
                                      { className: "w-5 h-5" }
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {recommendation.name}
                                    </h4>
                                    <span className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                                      {recommendation.confidence}% confianza
                                    </span>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {recommendation.description}
                                  </p>
                                  
                                  <div className="flex items-center space-x-2 text-xs">
                                    <Lightbulb className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                                    <span className="text-yellow-700 dark:text-yellow-300">
                                      {recommendation.reason}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => onSelectRecommendation(recommendation)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Usar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>No hay recomendaciones disponibles</p>
                      <p className="text-sm">Prueba con otro objetivo o ajusta los filtros</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Selecciona un objetivo
                  </h3>
                  <p>Elige un objetivo activo para recibir recomendaciones personalizadas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkRecommender;