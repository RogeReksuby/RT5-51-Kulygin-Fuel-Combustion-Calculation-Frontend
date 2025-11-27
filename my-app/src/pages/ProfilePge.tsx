import { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../api';
import { Header } from '../components/FuelDetailsHeader';
import { Footer } from '../components/FuelFooter';
import { ROUTES } from '../../Routes';
import type { RootState } from '../store';
import './ProfilePage.css';

// Интерфейс для данных, которые приходят ОТ бэкенда
interface BackendUserProfile {
  id?: number;
  login?: string;
  Name?: string;  // С заглавной - как приходит от бэкенда
  is_moderator?: boolean;
}

// Интерфейс для данных, которые отправляем НА бэкенд
interface UpdateProfileData {
  login?: string;
  name?: string;  // С маленькой - как ожидает бэкенд
}

const ProfilePage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  
  const [profile, setProfile] = useState<BackendUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    login: '',
  });

useEffect(() => {
  // Даем время на проверку авторизации
  const checkAuthAndLoad = setTimeout(() => {
    if (!isAuthenticated) {
      console.log('🚫 Пользователь не авторизован, редирект на логин');
      navigate(ROUTES.LOGIN);
      return;
    }

    loadProfile();
  }, 1000); // Небольшая задержка

  return () => clearTimeout(checkAuthAndLoad);
}, [isAuthenticated, navigate]);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate(ROUTES.LOGIN);
//       return;
//     }

//     loadProfile();
//   }, [isAuthenticated, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Загружаем данные профиля...');

      const response = await api.api.usersProfileList();
      console.log('📦 Полный ответ профиля:', response);
      
      // Получаем данные из правильного поля
      const backendData = response.data.data;
      console.log('📦 Данные пользователя:', backendData);
      
      const profileData: BackendUserProfile = {
        id: backendData.id,
        login: backendData.login,
        Name: backendData.Name, // Используем Name с заглавной как в API
        is_moderator: backendData.is_moderator
      };
      
      setProfile(profileData);
      
      // Заполняем форму данными
      setFormData({
        name: backendData.Name || '', // Преобразуем Name -> name для формы
        login: backendData.login || '',
      });
      
      console.log('✅ Профиль загружен:', profileData);
    } catch (error: any) {
      console.error('❌ Ошибка загрузки профиля:', error);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      console.log('💾 Сохраняем изменения профиля:', formData);

      // Создаем объект для отправки в правильном формате
      const updateData: UpdateProfileData = {
        login: formData.login,
        name: formData.name, // Отправляем как 'name' (с маленькой) как ожидает бэкенд
      };

      console.log('📤 Отправляем данные:', updateData);

      // Используем type assertion чтобы обойти проверку типов
      await api.api.usersProfileUpdate(updateData as any);

      console.log('✅ Профиль обновлен');
      
      setSuccess('Данные успешно сохранены!');
      
      // Перезагружаем данные профиля
      await loadProfile();
      
    } catch (error: any) {
      console.error('❌ Ошибка сохранения профиля:', error);
      setError(error.response?.data?.description || 'Не удалось сохранить данные');
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    if (profile) {
      setFormData({
        name: profile.Name || '', // Используем Name из профиля
        login: profile.login || '',
      });
      setError(null);
      setSuccess(null);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Header />
      
      <div className="profile-container">
        <h1 className="profile-title">Личный кабинет</h1>

        {loading && (
          <div className="loading-message">Загрузка данных профиля...</div>
        )}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadProfile} className="retry-button">
              Попробовать снова
            </button>
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {!loading && profile && (
          <div className="profile-content">
            <div className="profile-card">
              <h2>Информация о профиле</h2>
              
              <form onSubmit={handleSaveProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="login">Логин:</label>
                  <input
                    id="login"
                    name="login"
                    type="text"
                    value={formData.login}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Введите логин"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="name">Имя:</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Введите ваше имя"
                  />
                </div>

                <div className="form-group readonly">
                  <label>Роль:</label>
                  <div className="role-badge">
                    {profile.is_moderator ? 'Модератор' : 'Пользователь'}
                  </div>
                  <small className="hint">Роль нельзя изменить самостоятельно</small>
                </div>

                

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="save-button"
                    disabled={saving}
                  >
                    {saving ? 'Сохранение...' : 'Сохранить изменения'}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={handleResetForm}
                    className="reset-button"
                    disabled={saving}
                  >
                    Отменить
                  </button>
                </div>
              </form>
            </div>

            
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;