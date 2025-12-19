// Wolf HMS API Service
// Connects Wolf Care patient app to Wolf HMS backend

// API Configuration
// production URL for Wolf HMS
const CLOUD_URL = 'https://wolf-hms-server-1026194439642.asia-south1.run.app';

// Set to false to enforce Cloud connection
const USE_LOCAL = false; 
const API_BASE_URL = CLOUD_URL;

console.log('[API] Using server:', API_BASE_URL);

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`[API] ${options.method || 'GET'} ${url}`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            signal: controller.signal,
            ...options,
        });
        
        clearTimeout(timeout);
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || data.error || 'API request failed');
        }
        
        return { success: true, data };
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(`[API Timeout] ${endpoint}`);
            return { success: false, error: 'Request timed out' };
        }
        console.error(`[API Error] ${endpoint}:`, error.message);
        return { success: false, error: error.message };
    }
};

// ==================== PUBLIC ENDPOINTS (Patient App) ====================

// Register a new patient
export const registerPatient = async (patientData) => {
    return apiCall('/api/patients/register', {
        method: 'POST',
        body: JSON.stringify(patientData),
    });
};

// Get all doctors (for patient booking)
export const getDoctors = async () => {
    const result = await apiCall('/api/patients/doctors');
    if (result.success && result.data?.doctors) {
        return { success: true, data: result.data.doctors };
    }
    // If Cloud Run fails, return some demo data so app is usable
    if (!result.success) {
        console.log('[API] Returning demo doctors due to server error');
        return {
            success: true,
            data: [
                { id: 1, name: 'Dr. Demo Doctor', department: 'General', fee: 500 },
                { id: 2, name: 'Dr. Priya Sharma', department: 'Cardiology', fee: 800 },
                { id: 3, name: 'Dr. Rajesh Kumar', department: 'Orthopedics', fee: 700 },
            ],
            offline: true
        };
    }
    return result;
};

// Book an appointment
export const bookAppointment = async (appointmentData) => {
    return apiCall('/api/patients/book-appointment', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
    });
};

// Get patient's appointments
export const getPatientAppointments = async (phone) => {
    const result = await apiCall(`/api/patients/my-appointments?phone=${encodeURIComponent(phone)}`);
    if (result.success && result.data?.appointments) {
        return { success: true, data: result.data.appointments };
    }
    return result;
};

// Reschedule appointment
export const rescheduleAppointment = async (appointmentId, newDate, phone) => {
    return apiCall(`/api/patients/reschedule/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ newDate, phone }),
    });
};

// Get patient's lab orders
export const getPatientLabOrders = async (phone) => {
    const result = await apiCall(`/api/patients/lab-orders?phone=${encodeURIComponent(phone)}`);
    if (result.success && result.data?.labOrders) {
        return { success: true, data: result.data.labOrders };
    }
    return result;
};

// Get lab report details
export const getLabReport = async (orderId) => {
    const result = await apiCall(`/api/patients/lab-report/${orderId}`);
    if (result.success && result.data?.report) {
        return { success: true, data: result.data.report };
    }
    return result;
};

// Get patient's prescriptions
export const getPatientPrescriptions = async (phone) => {
    const result = await apiCall(`/api/patients/prescriptions?phone=${encodeURIComponent(phone)}`);
    if (result.success && result.data?.prescriptions) {
        return { success: true, data: result.data.prescriptions };
    }
    return result;
};

// Get patient's pharmacy orders
export const getPharmacyOrders = async (phone) => {
    const result = await apiCall(`/api/patients/pharmacy-orders?phone=${encodeURIComponent(phone)}`);
    if (result.success && result.data?.orders) {
        return { success: true, data: result.data.orders };
    }
    return result;
};

// Get patient's billing history
export const getBillingHistory = async (phone) => {
    const result = await apiCall(`/api/patients/billing-history?phone=${encodeURIComponent(phone)}`);
    if (result.success && result.data?.bills) {
        return { success: true, data: result.data.bills };
    }
    return result;
};

// ==================== HEALTH CHECK ====================

// Check if API is reachable
// Get full patient profile with stats
export const getPatientProfile = async (phone) => {
    return apiCall(`/api/patients/app/profile?phone=${encodeURIComponent(phone)}`);
};

export const checkApiHealth = async () => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE_URL}/api/patients/doctors`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) {
            console.error(`[API Health] Status: ${response.status} ${response.statusText}`);
        }
        
        return { success: response.ok, status: response.status };
    } catch (error) {
        console.error('[API Health Check Failed]:', error.message);
        return { success: false, error: error.message };
    }
};

// ==================== PAYMENT & BILLING (Razorpay Integration) ====================

/**
 * Create an invoice for an appointment/service
 * This creates a record in HMS Finance dashboard
 */
export const createAppointmentInvoice = async (appointmentData) => {
    // For appointments, we create a simple invoice without admission
    return apiCall('/api/patients/app/create-invoice', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
    });
};

/**
 * Create Razorpay payment order
 * Returns order details for Razorpay checkout
 */
export const createPaymentOrder = async (orderData) => {
    return apiCall('/api/patients/app/payment/order', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
};

/**
 * Verify payment after Razorpay checkout
 * Validates signature and records payment in HMS
 */
export const verifyPayment = async (paymentData) => {
    return apiCall('/api/patients/app/payment/verify', {
        method: 'POST',
        body: JSON.stringify(paymentData),
    });
};

/**
 * Record a payment against an invoice
 * Updates invoice status in HMS Finance dashboard
 */
export const recordPayment = async (invoiceId, paymentData) => {
    return apiCall(`/api/patients/app/payment/record/${invoiceId}`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
    });
};

/**
 * Get Razorpay configuration for client-side SDK
 */
export const getRazorpayConfig = async () => {
    return apiCall('/api/patients/app/payment/config');
};

export default {
    registerPatient,
    getDoctors,
    bookAppointment,
    getPatientAppointments,
    rescheduleAppointment,
    getPatientLabOrders,
    getLabReport,
    getPatientPrescriptions,
    getPharmacyOrders,
    getBillingHistory,
    getPatientProfile,
    checkApiHealth,
    // Payment & Billing
    createAppointmentInvoice,
    createPaymentOrder,
    verifyPayment,
    recordPayment,
    getRazorpayConfig,
    API_BASE_URL,
};
