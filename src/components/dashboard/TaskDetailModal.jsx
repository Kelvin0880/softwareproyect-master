// src/components/TaskDetailModal.jsx
import { X, User, Calendar, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function TaskDetailModal({ task, onClose }) {
  if (!task) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bg: 'bg-green-50',
          text: 'Completada'
        };
      case 'in_progress':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          text: 'En Progreso'
        };
      case 'review':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          text: 'En Revisión'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          text: 'Pendiente'
        };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'high':
        return { color: 'text-red-600', bg: 'bg-red-50', text: 'Alta' };
      case 'medium':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Media' };
      default:
        return { color: 'text-green-600', bg: 'bg-green-50', text: 'Baja' };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Detalles de la Tarea</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Title & Priority */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
                  {priorityConfig.text}
                </span>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
              </div>
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.text}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-2" />
                  Asignado a
                </div>
                <p className="text-sm font-medium text-gray-900">{task.assignee_name}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Fecha de creación
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(task.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}