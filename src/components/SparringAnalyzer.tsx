import React, { useState, useMemo } from 'react';
import { 
  Users, Target, TrendingUp, Filter, Search, Eye, 
  AlertTriangle, CheckCircle, X, Calendar, Clock,
  Zap, Shield, Brain, Heart, Star, BarChart3
} from 'lucide-react';
import { StudentProfile, SparringSession } from './StudentProfile';

interface CompatibilityMatch {
  student1: StudentProfile;
  student2: StudentProfile;
  compatibilityScore: number;
  reasons: string[];
  warnings: string[];
  previousSessions: number;
  lastSession?: Date;
  recommendation: 'ideal' | 'good' | 'acceptable' | 'not-recommended';
}

interface SparringAnalyzerProps {
  students: StudentProfile[];
  sparringSessions: SparringSession[];
  onCreateSession: (student1Id: string, student2Id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SparringAnalyzer: React.FC<SparringAnalyzerProps> = ({
  students,
  sparringSessions,
  onCreateSession,
  isOpen,
  onClose
}) => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'compatibility' | 'sessions' | 'lastSession'>('compatibility');

  // Calculate compatibility between two students
  const calculateCompatibility = (student1: StudentProfile, student2: StudentProfile): CompatibilityMatch => {
    const reasons: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    // Height compatibility (±10cm is ideal, ±15cm is acceptable)
    const heightDiff = Math.abs(student1.height - student2.height);
    if (heightDiff <= 5) {
      score += 25;
      reasons.push('Estatura muy similar');
    } else if (heightDiff <= 10) {
      score += 20;
      reasons.push('Estatura compatible');
    } else if (heightDiff <= 15) {
      score += 10;
      reasons.push('Diferencia de estatura aceptable');
    } else {
      warnings.push(`Gran diferencia de estatura (${heightDiff}cm)`);
    }

    // Weight compatibility (±5kg is ideal, ±10kg is acceptable)
    const weightDiff = Math.abs(student1.weight - student2.weight);
    if (weightDiff <= 3) {
      score += 25;
      reasons.push('Peso muy similar');
    } else if (weightDiff <= 5) {
      score += 20;
      reasons.push('Peso compatible');
    } else if (weightDiff <= 10) {
      score += 10;
      reasons.push('Diferencia de peso aceptable');
    } else {
      warnings.push(`Gran diferencia de peso (${weightDiff.toFixed(1)}kg)`);
    }

    // Level compatibility
    const levelValues = { principiante: 1, intermedio: 2, avanzado: 3, competidor: 4, elite: 5 };
    const level1 = levelValues[student1.level];
    const level2 = levelValues[student2.level];
    const levelDiff = Math.abs(level1 - level2);

    if (levelDiff === 0) {
      score += 30;
      reasons.push('Mismo nivel técnico');
    } else if (levelDiff === 1) {
      score += 25;
      reasons.push('Niveles técnicos compatibles');
    } else if (levelDiff === 2) {
      score += 15;
      reasons.push('Diferencia de nivel moderada');
    } else {
      score += 5;
      warnings.push('Gran diferencia de nivel técnico');
    }

    // Age compatibility (±5 years is ideal)
    const ageDiff = Math.abs(student1.age - student2.age);
    if (ageDiff <= 3) {
      score += 10;
      reasons.push('Edades similares');
    } else if (ageDiff <= 5) {
      score += 5;
      reasons.push('Diferencia de edad aceptable');
    } else if (ageDiff > 10) {
      warnings.push(`Gran diferencia de edad (${ageDiff} años)`);
    }

    // Complementary strengths and weaknesses
    const student1Strengths = student1.strengths || [];
    const student2Weaknesses = student2.weaknesses || [];
    const student2Strengths = student2.strengths || [];
    const student1Weaknesses = student1.weaknesses || [];

    // Check if one's strengths can help with the other's weaknesses
    const complementaryAreas = student1Strengths.filter(strength => 
      student2Weaknesses.some(weakness => 
        strength.toLowerCase().includes(weakness.toLowerCase().split(' ')[0]) ||
        weakness.toLowerCase().includes(strength.toLowerCase().split(' ')[0])
      )
    ).length + student2Strengths.filter(strength => 
      student1Weaknesses.some(weakness => 
        strength.toLowerCase().includes(weakness.toLowerCase().split(' ')[0]) ||
        weakness.toLowerCase().includes(strength.toLowerCase().split(' ')[0])
      )
    ).length;

    if (complementaryAreas > 0) {
      score += complementaryAreas * 5;
      reasons.push(`${complementaryAreas} área(s) complementaria(s)`);
    }

    // Previous sessions count
    const previousSessions = sparringSessions.filter(session => 
      (session.student1Id === student1.id && session.student2Id === student2.id) ||
      (session.student1Id === student2.id && session.student2Id === student1.id)
    ).length;

    const lastSession = sparringSessions
      .filter(session => 
        (session.student1Id === student1.id && session.student2Id === student2.id) ||
        (session.student1Id === student2.id && session.student2Id === student1.id)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    // Penalize too many recent sessions
    if (previousSessions > 5) {
      score -= 10;
      warnings.push(`Han sparreado juntos ${previousSessions} veces`);
    } else if (previousSessions > 0) {
      reasons.push(`${previousSessions} sesión(es) previa(s)`);
    }

    // Determine recommendation
    let recommendation: CompatibilityMatch['recommendation'];
    if (score >= 80 && warnings.length === 0) {
      recommendation = 'ideal';
    } else if (score >= 60 && warnings.length <= 1) {
      recommendation = 'good';
    } else if (score >= 40) {
      recommendation = 'acceptable';
    } else {
      recommendation = 'not-recommended';
    }

    return {
      student1,
      student2,
      compatibilityScore: Math.min(100, Math.max(0, score)),
      reasons,
      warnings,
      previousSessions,
      lastSession: lastSession?.date,
      recommendation
    };
  };

  // Generate all possible matches
  const allMatches = useMemo(() => {
    const matches: CompatibilityMatch[] = [];
    
    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        matches.push(calculateCompatibility(students[i], students[j]));
      }
    }

    return matches;
  }, [students, sparringSessions]);

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    let filtered = allMatches;

    // Filter by selected student
    if (selectedStudent) {
      filtered = filtered.filter(match => 
        match.student1.id === selectedStudent || match.student2.id === selectedStudent
      );
    }

    // Filter by level
    if (filterLevel !== 'all') {
      filtered = filtered.filter(match => 
        match.student1.level === filterLevel || match.student2.level === filterLevel
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(match => 
        match.student1.firstName.toLowerCase().includes(term) ||
        match.student1.lastName.toLowerCase().includes(term) ||
        match.student2.firstName.toLowerCase().includes(term) ||
        match.student2.lastName.toLowerCase().includes(term)
      );
    }

    // Sort matches
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'compatibility':
          return b.compatibilityScore - a.compatibilityScore;
        case 'sessions':
          return a.previousSessions - b.previousSessions;
        case 'lastSession':
          if (!a.lastSession && !b.lastSession) return 0;
          if (!a.lastSession) return 1;
          if (!b.lastSession) return -1;
          return a.lastSession.getTime() - b.lastSession.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [allMatches, selectedStudent, filterLevel, searchTerm, sortBy]);

  const getRecommendationColor = (recommendation: CompatibilityMatch['recommendation']) => {
    switch (recommendation) {
      case 'ideal': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'acceptable': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not-recommended': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getRecommendationLabel = (recommendation: CompatibilityMatch['recommendation']) => {
    switch (recommendation) {
      case 'ideal': return 'Ideal';
      case 'good': return 'Bueno';
      case 'acceptable': return 'Aceptable';
      case 'not-recommended': return 'No recomendado';
    }
  };

  const getRecommendationIcon = (recommendation: CompatibilityMatch['recommendation']) => {
    switch (recommendation) {
      case 'ideal': return <Star className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'acceptable': return <Eye className="w-4 h-4" />;
      case 'not-recommended': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Análisis de Sparring</h1>
                <p className="text-red-100">Emparejamientos inteligentes para entrenamientos efectivos</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>{filteredMatches.length} emparejamientos analizados</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{filteredMatches.filter(m => m.recommendation === 'ideal').length} ideales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar estudiante</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Nombre del estudiante..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante específico</label>
              <select
                value={selectedStudent || ''}
                onChange={(e) => setSelectedStudent(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Todos los estudiantes</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por nivel</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Todos los niveles</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
                <option value="competidor">Competidor</option>
                <option value="elite">Élite</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="compatibility">Compatibilidad</option>
                <option value="sessions">Menos sesiones</option>
                <option value="lastSession">Última sesión</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron emparejamientos</h3>
              <p>Ajusta los filtros para ver más resultados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((match, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                          <span className="text-red-600 font-bold text-lg">
                            {match.compatibilityScore}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            {match.student1.firstName} {match.student1.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {match.student1.height}cm • {match.student1.weight}kg • {match.student1.level}
                          </div>
                        </div>
                        
                        <div className="text-gray-400">
                          <Users className="w-5 h-5" />
                        </div>
                        
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            {match.student2.firstName} {match.student2.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {match.student2.height}cm • {match.student2.weight}kg • {match.student2.level}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(match.recommendation)}`}>
                        {getRecommendationIcon(match.recommendation)}
                        <span>{getRecommendationLabel(match.recommendation)}</span>
                      </span>
                      
                      <button
                        onClick={() => onCreateSession(match.student1.id, match.student2.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Programar Sparring
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reasons */}
                    {match.reasons.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Puntos a favor</span>
                        </h4>
                        <ul className="space-y-1">
                          {match.reasons.map((reason, idx) => (
                            <li key={idx} className="text-sm text-green-600 flex items-center space-x-2">
                              <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {match.warnings.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center space-x-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Consideraciones</span>
                        </h4>
                        <ul className="space-y-1">
                          {match.warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm text-orange-600 flex items-center space-x-2">
                              <div className="w-1 h-1 bg-orange-600 rounded-full"></div>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Session History */}
                  {match.previousSessions > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{match.previousSessions} sesión(es) previa(s)</span>
                        </div>
                        {match.lastSession && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Última: {match.lastSession.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SparringAnalyzer;