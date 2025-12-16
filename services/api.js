// API Service for Wolf HMS Backend
const API_BASE = 'http://localhost:5000/api';

export const api = {
    // Get doctors list from backend
    getDoctors: async () => {
        try {
            const response = await fetch(`${API_BASE}/patients/app/doctors`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error - getDoctors:', error);
            return { success: false, error: error.message };
        }
    },

    // Book appointment
    bookAppointment: async (bookingData) => {
        try {
            const response = await fetch(`${API_BASE}/patients/app/book-appointment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error - bookAppointment:', error);
            return { success: false, error: error.message };
        }
    },

    // Get patient's appointments
    getMyAppointments: async (phone) => {
        try {
            const response = await fetch(`${API_BASE}/patients/app/my-appointments/${phone}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error - getMyAppointments:', error);
            return { success: false, error: error.message };
        }
    },
};

export default api;
