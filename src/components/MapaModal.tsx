import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

type Props = {
  visivel: boolean;
  onFechar: () => void;
  localizacao: {
    latitude: number;
    longitude: number;
  } | null;
  tituloNota?: string;
};

const MapaModal = ({ visivel, onFechar, localizacao }: Props) => {

  if (!localizacao) return null;

  return (
    <Modal visible={visivel} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onFechar} >
            <Text style={styles.fechar}>✕</Text>
          </TouchableOpacity>
        </View>

        <MapView
          style={styles.mapa}
          initialRegion={{
            latitude: localizacao.latitude,
            longitude: localizacao.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            coordinate={localizacao}
          />
        </MapView>
      </SafeAreaView>
    </Modal>
  );
};

export default MapaModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 50,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  fechar: {
    fontSize: 20,
    color: COLORS.primary,
  },
  textoFechar: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  mapa: {
    flex: 1,
  },
});