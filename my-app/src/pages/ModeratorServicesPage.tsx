import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from '../components/FuelDetailsHeader';
import { Footer } from '../components/FuelFooter';
import { Breadcrumbs } from '../components/BreadCrumbs';
import type { AppDispatch, RootState } from '../store';
import { 
  getFuelsList,
  createFuel,
  updateFuel,
  deleteFuel,
  selectFuels,
  selectFuelsLoading,
  selectFuelsError,
  uploadFuelImage
} from '../store/slices/fuelsSlice';
import { transformImageUrl } from '../target_config';
import DefaultImage from '../assets/DefaultImage.jpg';
import './ModeratorServicesPage.css';

// Модальное окно для создания/редактирования
import ServiceModal from '../components/ServiceModal';

const ModeratorServicesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const fuels = useSelector(selectFuels);
  const loading = useSelector(selectFuelsLoading);
  const error = useSelector(selectFuelsError);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Загружаем список услуг при загрузке страницы
  useEffect(() => {
    dispatch(getFuelsList({ title: searchQuery || undefined }));
  }, [dispatch, searchQuery]);

  // Обработчики действий
  const handleCreate = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      await dispatch(deleteFuel(id));
      dispatch(getFuelsList({})); // Обновляем список
    }
  };

const handleSaveService = async (formData: any, imageFile?: File) => {
  console.log('📝 Данные из формы:', formData);
  console.log('🖼️ Файл изображения:', imageFile);
  console.log('🔄 Редактируемая услуга:', editingService);
  
  // Проверяем, что formData не пустой
  if (!formData || Object.keys(formData).length === 0) {
    console.error('❌ formData пустой!');
    alert('Данные формы пустые');
    return;
  }
  
  try {
    if (editingService) {
      console.log('📤 Отправка обновления для ID:', editingService.id);
      
      // Создаем объект с гарантированно заполненными полями
      const fuelData: any = {};
      
      // Только те поля, которые действительно изменились и не пустые
      if (formData.title !== undefined && formData.title !== '') 
        fuelData.title = formData.title;
      if (formData.heat !== undefined && formData.heat !== 0) 
        fuelData.heat = Number(formData.heat);
      if (formData.molar_mass !== undefined && formData.molar_mass !== '') 
        fuelData.molar_mass = Number(formData.molar_mass);
      if (formData.density !== undefined && formData.density !== '') 
        fuelData.density = Number(formData.density);
      if (formData.short_desc !== undefined) 
        fuelData.short_desc = formData.short_desc;
      if (formData.full_desc !== undefined) 
        fuelData.full_desc = formData.full_desc;
      if (formData.is_gas !== undefined) 
        fuelData.is_gas = Boolean(formData.is_gas);
      
      console.log('📦 Подготовленные данные для API:', fuelData);
      
      // Проверяем, есть ли что отправлять
      if (Object.keys(fuelData).length === 0 && !imageFile) {
        alert('Нет данных для обновления');
        return;
      }
      
      // Обновляем данные услуги (если есть изменения)
      if (Object.keys(fuelData).length > 0) {
        await dispatch(updateFuel({ 
          id: editingService.id, 
          fuelData 
        })).unwrap();
        console.log('✅ Данные услуги обновлены');
      }
      
      // Если есть новая картинка - загружаем её
      if (imageFile) {
        console.log('📤 Загрузка изображения для услуги ID:', editingService.id);
        try {
          await dispatch(uploadFuelImage({ 
            id: editingService.id, 
            image: imageFile 
          })).unwrap();
          console.log('✅ Изображение успешно загружено');
        } catch (imageError: any) {
          console.warn('⚠️ Ошибка загрузки изображения:', imageError);
          // Не прерываем весь процесс, просто показываем предупреждение
          alert('Услуга обновлена, но не удалось загрузить изображение');
        }
      }
      
      alert('Услуга успешно обновлена!');
      
    } else {
      // СОЗДАНИЕ новой услуги
      console.log('📤 Создание новой услуги');
      
      // Подготавливаем данные для создания
      const createData: any = {};
      
      // Обязательные поля
      if (formData.title) createData.title = formData.title;
      if (formData.heat) createData.heat = Number(formData.heat);
      
      // Необязательные поля
      if (formData.molar_mass !== undefined && formData.molar_mass !== '') 
        createData.molar_mass = Number(formData.molar_mass);
      if (formData.density !== undefined && formData.density !== '') 
        createData.density = Number(formData.density);
      if (formData.short_desc) createData.short_desc = formData.short_desc;
      if (formData.full_desc) createData.full_desc = formData.full_desc;
      if (formData.is_gas !== undefined) 
        createData.is_gas = Boolean(formData.is_gas);
      
      console.log('📦 Данные для создания:', createData);
      
      // Создаем услугу
      const result = await dispatch(createFuel(createData)).unwrap();
      console.log('✅ Услуга создана:', result);
      
      // Если услуга создана успешно и есть картинка
      if (imageFile && result?.data?.id) {
        const newServiceId = result.data.id;
        console.log('📤 Загрузка изображения для новой услуги ID:', newServiceId);
        
        try {
          await dispatch(uploadFuelImage({ 
            id: newServiceId, 
            image: imageFile 
          })).unwrap();
          console.log('✅ Изображение загружено для новой услуги');
        } catch (imageError: any) {
          console.warn('⚠️ Ошибка загрузки изображения для новой услуги:', imageError);
          alert('Услуга создана, но не удалось загрузить изображение');
        }
      }
      
      alert('Услуга успешно создана!');
    }
    
    // Закрываем модалку и обновляем список
    setIsModalOpen(false);
    setEditingService(null);
    dispatch(getFuelsList({}));
    
  } catch (error: any) {
    console.error('❌ Ошибка сохранения:', error);
    alert(`Ошибка: ${error.message || 'Не удалось сохранить услугу'}`);
  }
};

  // Фильтруем услуги (исключаем удаленные)
  const activeServices = fuels.filter(fuel => !fuel.is_delete);

  return (
    <div>
      <Header />
      <Breadcrumbs />
      
      <div className="moderator-services-container">
        <div className="services-header">
          <h1 className="services-title">Управление видами топлива</h1>
          <div className="services-actions">
            
            <button 
              className="create-button"
              onClick={handleCreate}
            >
              + Добавить услугу
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Загрузка услуг...</div>
        ) : activeServices.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? 'Ничего не найдено' : 'Список услуг пуст'}
          </div>
        ) : (
          <div className="services-table-container">
            <table className="services-table">
              <thead>
                <tr>
                  <th>Изображение</th>
                  <th>Название</th>
                  <th>Теплота сгорания</th>
                  <th>Молярная масса</th>
                  <th>Плотность</th>
                  <th>Тип</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {activeServices.map(service => (
                  <tr key={service.id} className="service-row">
                    <td className="image-cell">
                      <div 
                        className="service-image"
                        style={{
                          backgroundImage: `url(${transformImageUrl(service.card_image) || DefaultImage})`
                        }}
                      />
                    </td>
                    <td className="title-cell">
                      <div className="service-title">{service.title}</div>
                      <div className="service-desc">{service.short_desc}</div>
                    </td>
                    <td className="heat-cell">{service.heat} кДж</td>
                    <td className="mass-cell">{service.molar_mass || '—'}</td>
                    <td className="density-cell">{service.density || '—'}</td>
                    <td className="type-cell">
                      {service.is_gas ? 'Газ' : 'Жидкость'}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${service.is_delete ? 'deleted' : 'active'}`}>
                        {service.is_delete ? 'Удален' : 'Активен'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          className="edit-button"
                          onClick={() => handleEdit(service)}
                        >
                          Редактировать
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDelete(service.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />

      {/* Модальное окно для создания/редактирования */}
      {isModalOpen && (
        <ServiceModal
          service={editingService}
          onSave={handleSaveService}
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
};

export default ModeratorServicesPage;