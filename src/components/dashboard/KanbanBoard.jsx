import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, AlertTriangle, Clock, CheckCircle2, UserCircle, PencilIcon, TrashIcon, Eye } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    borderColor: 'border-red-100',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    dotColor: 'text-red-600',
    icon: AlertTriangle
  },
  in_progress: {
    label: 'En Progreso',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    dotColor: 'text-blue-600',
    icon: Clock
  },
  review: {
    label: 'En Revisión',
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    borderColor: 'border-yellow-100',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    dotColor: 'text-yellow-600',
    icon: Clock
  },
  completed: {
    label: 'Completado',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    borderColor: 'border-green-100',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    dotColor: 'text-green-600',
    icon: CheckCircle2
  }
};

const PRIORITY_BADGES = {
  high: 'text-red-700 bg-red-50',
  medium: 'text-yellow-700 bg-yellow-50',
  low: 'text-green-700 bg-green-50'
};

export default function KanbanBoard({ tasks = [], onTaskMove, isAdmin = false, onEdit, onDelete, onViewDetails }) {
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    await onTaskMove(draggableId, destination.droppableId);
  };

  const tasksByStatus = {
    pending: tasks.filter(task => task.status === 'pending'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    review: tasks.filter(task => task.status === 'review'),
    completed: tasks.filter(task => task.status === 'completed')
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <div key={status} className="bg-white rounded-lg shadow">
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <config.icon className={`w-5 h-5 ${config.dotColor}`} />
                <h3 className="text-gray-900 font-semibold">{config.label}</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {tasksByStatus[status]?.length || 0} Total
                </span>
              </div>
            </div>

            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 min-h-[200px] ${snapshot.isDraggingOver ? config.lightColor : ''}`}
                >
                  <div className="space-y-3">
                    {tasksByStatus[status]?.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg border ${config.borderColor} ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'} transition-shadow duration-200`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_BADGES[task.priority]}`}>{task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}</span>
                                <h4 className="font-medium text-gray-900 mt-2 truncate">{task.title}</h4>
                              </div>
                              <div className="flex gap-2 ml-2">
                                <button onClick={() => onViewDetails(task)} className="text-gray-600 hover:text-gray-800"><Eye className="w-4 h-4" /></button>
                                {isAdmin && (
                                  <>
                                    <button onClick={() => onEdit(task)} className="text-blue-600 hover:text-blue-800"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => onDelete(task.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-4 h-4" /></button>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                            <div className="flex items-center text-sm">
                              <UserCircle className="w-5 h-5 text-gray-400 mr-2" />
                              <span className="text-gray-600">{task.assignee_name}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
