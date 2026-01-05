import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { INDIAN_CITIES } from '../data/cities';

interface CityPickerProps {
    visible: boolean;
    onSelect: (city: { name: string, lat: number, lng: number }) => void;
    onClose: () => void;
}

export default function CityPicker({ visible, onSelect, onClose }: CityPickerProps) {
    const [search, setSearch] = useState('');

    const filteredCities = INDIAN_CITIES.filter(city =>
        city.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <LinearGradient colors={['#1A1A2E', '#0F0F1A']} style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select City</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search city..."
                        placeholderTextColor="#666"
                        value={search}
                        onChangeText={setSearch}
                    />

                    <FlatList
                        data={filteredCities}
                        keyExtractor={(item) => item.name}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.cityItem}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.cityName}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </LinearGradient>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { height: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    closeText: { color: '#00CEC9', fontSize: 16 },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        marginBottom: 20,
    },
    cityItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    cityName: { color: '#fff', fontSize: 18 }
});
