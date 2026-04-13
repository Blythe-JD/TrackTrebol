const ApiService = {
    async getTrucks() {
        return [
            { id: 1, plate: 'LPZ-4412', model: 'Volvo FH16 (2024)', imei: '354210009211234', status: 'moving', operative_state: 'En Servicio', lat: -16.500, lng: -68.120 },
            { id: 2, plate: 'LPZ-8891', model: 'Scania R500 (2023)', imei: '354210009599876', status: 'stopped', operative_state: 'En Descanso', lat: -16.510, lng: -68.130 }
        ];
    },
    async getDrivers() {
        return [
            { id: '1', name: 'Angel Alejandro Cori', ci: '12345678', license: 'Categoría C', vencimiento: '2027-10-10' },
            { id: '2', name: 'Alizon Chuquimima', ci: '87654321', license: 'Categoría B', vencimiento: '2028-05-15' }
        ];
    }
};