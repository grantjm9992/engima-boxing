import { Client } from '@notionhq/client';

export class NotionService {
  private client: Client | null = null;
  private databaseId: string | null = null;

  constructor() {
    // Inicializar el cliente solo si las variables de entorno están disponibles
    const apiKey = import.meta.env.VITE_NOTION_API_KEY;
    const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;
    
    if (apiKey) {
      this.client = new Client({ auth: apiKey });
      this.databaseId = databaseId || null;
    }
  }

  isConfigured(): boolean {
    return !!this.client && !!this.databaseId;
  }

  async createClassEntry(classData: {
    title: string;
    date: string;
    tags: string[];
    totalDuration: number;
    objective: string;
    notes?: string;
    blocks: any[];
  }): Promise<string | null> {
    if (!this.client || !this.databaseId) {
      console.error('Notion API no configurada. Verifica las variables de entorno.');
      return null;
    }

    try {
      // Formatear los bloques para Notion
      const blocksContent = classData.blocks.map(block => {
        const exercisesText = block.exercises.map((ex: any) => {
          if ('timers' in ex) {
            // Es un ejercicio multitimer
            return `- ${ex.name} (Multitimer: ${ex.timers.length} timers, ${ex.rounds} rondas)`;
          } else {
            // Es un ejercicio estándar
            return `- ${ex.name} (${ex.duration / 60}min x ${ex.rounds} rondas)`;
          }
        }).join('\n');

        return `### ${block.name}\n${exercisesText}`;
      }).join('\n\n');

      // Crear la entrada en Notion
      const response = await this.client.pages.create({
        parent: { database_id: this.databaseId },
        properties: {
          'Nombre': {
            title: [
              {
                text: {
                  content: classData.title
                }
              }
            ]
          },
          'Fecha': {
            date: {
              start: classData.date
            }
          },
          'Duración': {
            number: classData.totalDuration
          },
          'Etiquetas': {
            multi_select: classData.tags.map(tag => ({ name: tag }))
          }
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ type: 'text', text: { content: 'Objetivo' } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: classData.objective } }]
            }
          },
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ type: 'text', text: { content: 'Estructura de la Clase' } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: blocksContent } }]
            }
          },
          ...(classData.notes ? [
            {
              object: 'block',
              type: 'heading_2',
              heading_2: {
                rich_text: [{ type: 'text', text: { content: 'Notas Adicionales' } }]
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: classData.notes } }]
              }
            }
          ] : [])
        ]
      });

      return response.id;
    } catch (error) {
      console.error('Error al crear entrada en Notion:', error);
      return null;
    }
  }

  async updateClassEntry(
    notionPageId: string,
    classData: {
      title: string;
      date: string;
      tags: string[];
      totalDuration: number;
      objective: string;
      notes?: string;
      blocks: any[];
    }
  ): Promise<boolean> {
    if (!this.client) {
      console.error('Notion API no configurada. Verifica las variables de entorno.');
      return false;
    }

    try {
      // Actualizar propiedades de la página
      await this.client.pages.update({
        page_id: notionPageId,
        properties: {
          'Nombre': {
            title: [
              {
                text: {
                  content: classData.title
                }
              }
            ]
          },
          'Fecha': {
            date: {
              start: classData.date
            }
          },
          'Duración': {
            number: classData.totalDuration
          },
          'Etiquetas': {
            multi_select: classData.tags.map(tag => ({ name: tag }))
          }
        }
      });

      // Formatear los bloques para Notion
      const blocksContent = classData.blocks.map(block => {
        const exercisesText = block.exercises.map((ex: any) => {
          if ('timers' in ex) {
            // Es un ejercicio multitimer
            return `- ${ex.name} (Multitimer: ${ex.timers.length} timers, ${ex.rounds} rondas)`;
          } else {
            // Es un ejercicio estándar
            return `- ${ex.name} (${ex.duration / 60}min x ${ex.rounds} rondas)`;
          }
        }).join('\n');

        return `### ${block.name}\n${exercisesText}`;
      }).join('\n\n');

      // Obtener los bloques actuales
      const { results } = await this.client.blocks.children.list({
        block_id: notionPageId
      });

      // Eliminar los bloques existentes
      for (const block of results) {
        await this.client.blocks.delete({
          block_id: block.id
        });
      }

      // Añadir los nuevos bloques
      await this.client.blocks.children.append({
        block_id: notionPageId,
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ type: 'text', text: { content: 'Objetivo' } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: classData.objective } }]
            }
          },
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ type: 'text', text: { content: 'Estructura de la Clase' } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: blocksContent } }]
            }
          },
          ...(classData.notes ? [
            {
              object: 'block',
              type: 'heading_2',
              heading_2: {
                rich_text: [{ type: 'text', text: { content: 'Notas Adicionales' } }]
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: classData.notes } }]
              }
            }
          ] : [])
        ]
      });

      return true;
    } catch (error) {
      console.error('Error al actualizar entrada en Notion:', error);
      return false;
    }
  }

  async deleteClassEntry(notionPageId: string): Promise<boolean> {
    if (!this.client) {
      console.error('Notion API no configurada. Verifica las variables de entorno.');
      return false;
    }

    try {
      await this.client.pages.update({
        page_id: notionPageId,
        archived: true
      });
      return true;
    } catch (error) {
      console.error('Error al eliminar entrada en Notion:', error);
      return false;
    }
  }
}

export const notionService = new NotionService();