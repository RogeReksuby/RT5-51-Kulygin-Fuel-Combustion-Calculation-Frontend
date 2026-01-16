import React, { useState, useEffect } from 'react';
import './ServiceModal.css';

interface ServiceFormData {
  title: string;
  heat: number;
  molar_mass?: number;
  density?: number;
  short_desc?: string;
  full_desc?: string;
  is_gas?: boolean;
  card_image?: string; // URL существующего изображения
}

interface ServiceModalProps {
  service: ServiceFormData | null;
  onSave: (data: ServiceFormData, imageFile?: File) => void; // Только File или undefined
  onClose: () => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ service, onSave, onClose }) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    heat: 0,
    molar_mass: undefined,
    density: undefined,
    short_desc: '',
    full_desc: '',
    is_gas: false,
    card_image: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Инициализируем форму данными услуги при редактировании
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        heat: service.heat || 0,
        molar_mass: service.molar_mass,
        density: service.density,
        short_desc: service.short_desc || '',
        full_desc: service.full_desc || '',
        is_gas: service.is_gas || false,
        card_image: service.card_image || '',
      });
      
      // Если у услуги уже есть картинка, показываем её
      if (service.card_image) {
        setImagePreview(service.card_image);
      } else {
        setImagePreview(null);
      }
    } else {
      // Сбрасываем форму для создания
      setFormData({
        title: '',
        heat: 0,
        molar_mass: undefined,
        density: undefined,
        short_desc: '',
        full_desc: '',
        is_gas: false,
        card_image: '',
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
  }, [service]);

  // Обработчик выбора файла изображения
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 5MB');
        return;
      }
      
      // Проверяем тип файла
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        alert('Поддерживаются только JPG и PNG изображения');
        return;
      }
      
      setImageFile(file);
      
      // Создаем превью для отображения
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Удаление выбранного изображения
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }

    if (!formData.heat || formData.heat <= 0) {
      newErrors.heat = 'Теплота сгорания должна быть положительным числом';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData, imageFile || undefined);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? undefined : parseFloat(value) 
      }));
    } else if (name === 'is_gas') {
      // ОСОБАЯ ОБРАБОТКА ДЛЯ is_gas - преобразуем string в boolean
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const isEditing = !!service;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? 'Редактирование услуги' : 'Создание новой услуги'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-group">
            <label htmlFor="title">
              Название <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="Введите название услуги"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="heat">
                Теплота сгорания (кДж) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="heat"
                name="heat"
                value={formData.heat || ''}
                onChange={handleChange}
                step="0.1"
                min="0"
                className={errors.heat ? 'error' : ''}
              />
              {errors.heat && <span className="error-message">{errors.heat}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="molar_mass">Молярная масса (г/моль)</label>
              <input
                type="number"
                id="molar_mass"
                name="molar_mass"
                value={formData.molar_mass || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="density">Плотность (кг/м³)</label>
              <input
                type="number"
                id="density"
                name="density"
                value={formData.density || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                
              />
            </div>

            <div className="form-group">
              <label htmlFor="is_gas">Тип топлива</label>
              <select
                id="is_gas"
                name="is_gas"
                value={formData.is_gas ? 'true' : 'false'}
                onChange={handleChange}
              >
                <option value="false">Жидкость</option>
                <option value="true">Газ</option>
              </select>
            </div>
          </div>

          {/* Поле для загрузки изображения */}
          <div className="form-group">
            <label htmlFor="image">Изображение услуги</label>
            
            {/* Превью выбранного изображения */}
            {imagePreview && (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img 
                    src={imagePreview} 
                    alt="Предпросмотр изображения" 
                    className="preview-image"
                  />
                </div>
                <button 
                  type="button"
                  className="remove-image-button"
                  onClick={handleRemoveImage}
                >
                  Удалить изображение
                </button>
              </div>
            )}
            
            {/* Кнопка выбора файла */}
            <div className="file-upload-container">
              <label htmlFor="image-upload" className="file-upload-label">
                <span className="upload-icon">📁</span>
                <span className="upload-text">
                  {imageFile ? 'Файл выбран' : 'Выберите файл изображения'}
                </span>
                {imageFile && (
                  <span className="file-name">({imageFile.name})</span>
                )}
              </label>
              <input
                type="file"
                id="image-upload"
                name="image"
                accept=".jpg,.jpeg,.png,.gif"
                onChange={handleImageChange}
                className="file-input"
              />
            </div>
            
            <div className="file-hint">
              Поддерживаемые форматы: JPG, PNG, GIF. Максимальный размер: 5MB.
              {isEditing && service?.card_image && !imagePreview && (
                <div className="existing-image-note">
                  Текущее изображение сохранится, если не загружать новое.
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="short_desc">Краткое описание</label>
            <textarea
              id="short_desc"
              name="short_desc"
              value={formData.short_desc}
              onChange={handleChange}
              rows={3}
              placeholder="Краткое описание услуги (отображается в карточке)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="full_desc">Полное описание</label>
            <textarea
              id="full_desc"
              name="full_desc"
              value={formData.full_desc}
              onChange={handleChange}
              rows={5}
              placeholder="Полное описание услуги (отображается на детальной странице)"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="save-button">
              {isEditing ? 'Сохранить изменения' : 'Создать услугу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;