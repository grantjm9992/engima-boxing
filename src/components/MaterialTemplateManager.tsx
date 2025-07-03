import React, { useState } from 'react';
import { Plus, X, Package, Shield, Users, Target, Edit3, Trash2, Save, Copy } from 'lucide-react';
import { MaterialItem } from './WorkoutPreview';
import { TagType } from './TagManager';

export interface MaterialTemplate {
  id: string;
  name: string;
  description: string;
  materials: MaterialItem[];
  associatedTags: string[];
  createdAt: Date;
  isDefault?: boolean;
}

interface MaterialTemplateManagerProps {
  templates: MaterialTemplate[];
  availableTags: TagType[];
  onCreateTemplate: (template: Omit<MaterialTemplate, 'id' | 'createdAt'>) => void;
  onUpdateTemplate: (id: string, updates: Partial<MaterialTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MaterialTemplateManager: React.FC<MaterialTemplateManagerProps> = ({
  templates,
  availableTags,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  isOpen,
  onClose
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState<{
    name: string;
    description: string;
    materials: MaterialItem[];
    associatedTags: string[];
  }>({
    name: '',
    description: '',
    materials: [],
    associatedTags: []
  });

  const materialCategories = [
    { id: 'protection', label: 'Protección', icon: Shield },
    { id: 'equipment', label: 'Equipamiento', icon: Target },
    { id: 'clothing', label: 'Vestimenta', icon: Users },
    { id: 'accessories', label: 'Accesorios', icon: Package }
  ];

  const defaultMaterials = {
    protection: [
      'Casco de boxeo', 'Protector bucal', 'Coquilla', 'Guantes de boxeo',
      'Vendas para manos', 'Protector de pecho', 'Espinilleras'
    ],
    equipment: [
      'Saco de boxeo', 'Peras de velocidad', 'Manoplas', 'Paos',
      'Cuerda para saltar', 'Pesas', 'Mancuernas', 'Kettlebells'
    ],
    clothing: [
      'Ropa deportiva', 'Zapatillas de boxeo', 'Shorts de boxeo',
      'Camiseta técnica', 'Calcetines deportivos'
    ],
    accessories: [
      'Toalla', 'Botella de agua', 'Cronómetro', 'Música/Auriculares',
      'Bolsa deportiva', 'Desinfectante'
    ]
  };

  const handleCreateTemplate = () => {
    if (templateForm.name.trim()) {
      onCreateTemplate({
        name: templateForm.name.trim(),
        description: templateForm.description.trim(),
        materials: templateForm.materials,
        associatedTags: templateForm.associatedTags
      });
      resetForm();
    }
  };

  const handleUpdateTemplate = () => {
    if (editingTemplate && templateForm.name.trim()) {
      onUpdateTemplate(editingTemplate, {
        name: templateForm.name.trim(),
        description: templateForm.description.trim(),
        materials: templateForm.materials,
        associatedTags: templateForm.associatedTags
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      materials: [],
      associatedTags: []
    });
    setIsCreating(false);
    setEditingTemplate(null);
  };

  const startEditing = (template: MaterialTemplate) => {
    setTemplateForm({
      name: template.name,
      description: template.description,
      materials: [...template.materials],
      associatedTags: [...template.associatedTags]
    });
    setEditingTemplate(template.id);
    setIsCreating(false);
  };

  const addMaterial = (category: string, name: string, required: boolean = false) => {
    const newMaterial: MaterialItem = {
      id: `material_${Date.now()}_${Math.random()}`,
      name,
      required,
      category: category as MaterialItem['category']
    };
    setTemplateForm(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial]
    }));
  };

  const removeMaterial = (materialId: string) => {
    setTemplateForm(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== materialId)
    }));
  };

  const toggleMaterialRequired = (materialId: string) => {
    setTemplateForm(prev => ({
      ...prev,
      materials: prev.materials.map(m =>
        m.id === materialId ? { ...m, required: !m.required } : m
      )
    }));
  };

  const duplicateTemplate = (template: MaterialTemplate) => {
    onCreateTemplate({
      name: `${template.name} (Copia)`,
      description: template.description,
      materials: template.materials.map(m => ({ ...m, id: `material_${Date.now()}_${Math.random()}` })),
      associatedTags: [...template.associatedTags]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Plantillas de Material</h2>
                <p className="text-gray-600">Gestiona plantillas de material para diferentes tipos de entrenamiento</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Templates List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => {
                  setIsCreating(true);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all flex items-center justify-center space-x-2 text-gray-600 hover:text-green-600 mb-4"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Plantilla</span>
              </button>

              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      editingTemplate === template.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => startEditing(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{template.materials.length} materiales</span>
                          <span>{template.associatedTags.length} etiquetas</span>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTemplate(template);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {!template.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTemplate(template.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div className="flex-1 overflow-y-auto">
            {(isCreating || editingTemplate) ? (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {isCreating ? 'Crear Nueva Plantilla' : 'Editar Plantilla'}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Ej: Material para Sparring, Entrenamiento Técnico..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        value={templateForm.description}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={2}
                        placeholder="Describe cuándo usar esta plantilla..."
                      />
                    </div>
                  </div>
                </div>

                {/* Materials by Category */}
                <div className="space-y-6">
                  {materialCategories.map((category) => {
                    const categoryMaterials = templateForm.materials.filter(m => m.category === category.id);
                    const CategoryIcon = category.icon;
                    
                    return (
                      <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <CategoryIcon className="w-5 h-5 text-gray-600" />
                            <h4 className="font-medium text-gray-900">{category.label}</h4>
                            <span className="text-sm text-gray-500">({categoryMaterials.length})</span>
                          </div>
                          <div className="flex space-x-2">
                            {defaultMaterials[category.id as keyof typeof defaultMaterials].slice(0, 3).map((material) => (
                              <button
                                key={material}
                                onClick={() => addMaterial(category.id, material)}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                              >
                                + {material}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {categoryMaterials.map((material) => (
                            <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={material.required}
                                  onChange={() => toggleMaterialRequired(material.id)}
                                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className={`${material.required ? 'font-medium text-red-900' : 'text-gray-700'}`}>
                                  {material.name}
                                </span>
                                {material.required && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                    Obligatorio
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => removeMaterial(material.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder={`Agregar ${category.label.toLowerCase()}...`}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                addMaterial(category.id, e.currentTarget.value.trim());
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={isCreating ? handleCreateTemplate : handleUpdateTemplate}
                    disabled={!templateForm.name.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isCreating ? 'Crear' : 'Guardar'}</span>
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Selecciona una plantilla para editarla</p>
                <p className="text-sm">o crea una nueva plantilla</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialTemplateManager;