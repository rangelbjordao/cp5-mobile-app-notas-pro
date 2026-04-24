import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";

type Props = {
  visivel: boolean;
  onFechar: () => void;
  localizacao: {
    latitude: number;
    longitude: number;
    endereco?: string;
  } | null;
  tituloNota?: string;
};

const MapaModal = ({ visivel, onFechar, localizacao, tituloNota }: Props) => {
  if (!localizacao) return null;

  const latitude = Number(localizacao.latitude);
  const longitude = Number(localizacao.longitude);

  const region = {
    latitude,
    longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent={false}
      onRequestClose={onFechar}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo} numberOfLines={1}>
            {tituloNota || "Localização"}
          </Text>

          <TouchableOpacity onPress={onFechar}>
            <Text style={styles.fechar}>✕</Text>
          </TouchableOpacity>
        </View>

        <MapView
          key={`${latitude}-${longitude}`}
          provider={PROVIDER_GOOGLE}
          style={styles.mapa}
          region={region}
          mapType="standard"
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={{
              latitude,
              longitude,
            }}
            title={tituloNota || "Nota"}
            description={localizacao.endereco}
          />
        </MapView>

        {localizacao.endereco ? (
          <View style={styles.enderecoContainer}>
            <Text style={styles.enderecoTexto}>{localizacao.endereco}</Text>
          </View>
        ) : null}
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
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  titulo: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.texto,
    marginRight: 12,
  },
  fechar: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: "700",
  },
  mapa: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  enderecoContainer: {
    padding: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  enderecoTexto: {
    fontSize: 13,
    color: COLORS.subtitulo,
    textAlign: "center",
  },
});