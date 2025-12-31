import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function SafeModeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            {/* Mimic a generic News App or System Settings */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Daily News</Text>
            </View>
            <View style={styles.article}>
                <View style={styles.imagePlaceholder} />
                <View style={styles.textLine} />
                <View style={styles.textLine} />
                <View style={styles.textLineShort} />
            </View>
            <View style={styles.article}>
                <View style={styles.imagePlaceholder} />
                <View style={styles.textLine} />
                <View style={styles.textLine} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' }, // Bright, normal app look
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerText: { fontSize: 24, fontWeight: 'bold' },
    article: { padding: 20 },
    imagePlaceholder: { height: 150, backgroundColor: '#eee', borderRadius: 8, marginBottom: 10 },
    textLine: { height: 12, backgroundColor: '#eee', marginBottom: 6, borderRadius: 4 },
    textLineShort: { height: 12, width: '60%', backgroundColor: '#eee', marginBottom: 6, borderRadius: 4 }
});
