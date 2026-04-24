import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../services/firebaseConfig";
import { COLORS } from "../constants/colors";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import { enviarNotificacaoLocal } from "../services/notificationService";

type Nota = {
  id: string;
  titulo: string;
  conteudo: string;
  localizacao?: {
    latitude: number;
    longitude: number;
    endereco?: string;
  };
  criadoEm: any;
};

type Props = {
  visivel: boolean;
  onFechar: () => void;
  notaExistente?: Nota | null;
};

const NotaModal = ({ visivel, onFechar, notaExistente }: Props) => {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const { t } = useTranslation();

  const editando = !!notaExistente;

  useEffect(() => {
    if (notaExistente) {
      setTitulo(notaExistente.titulo);
      setConteudo(notaExistente.conteudo);
    } else {
      setTitulo("");
      setConteudo("");
    }
  }, [notaExistente, visivel]);

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      Alert.alert(t("attention"), t("field_required"));
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      let localizacao = null;

      const status = await new Promise<string>((resolve) => {
        Alert.alert(
          t("location_permission_title"),
          t("location_permission_message"),
          [
            {
              text: t("deny"),
              style: "cancel",
              onPress: () => resolve("denied"),
            },
            {
              text: t("allow"),
              onPress: async () => {
                const { status } = await Location.requestForegroundPermissionsAsync();
                resolve(status);
              },
            },
          ]
        );
      });

      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({});

          const enderecoResultado = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          const endereco = enderecoResultado[0];

          const enderecoFormatado = endereco
            ? [
              endereco.street,
              endereco.district,
              endereco.city || endereco.subregion,
              endereco.region,
            ]
              .filter(Boolean)
              .join(", ")
            : "";

          localizacao = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            endereco: enderecoFormatado,
          };
        } catch (err) {
          console.log("Erro ao obter posição", err);
          Alert.alert(t("attention"), t("location_error"));
        }
      } else {
        Alert.alert(t("attention"), t("location_permission_denied"));
      }

      const dadosNota: any = {
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
      };


      if (localizacao) {
        dadosNota.localizacao = localizacao;
      }

      if (editando && notaExistente) {
        await updateDoc(doc(db, "notas", notaExistente.id), dadosNota);
      } else {
        await addDoc(collection(db, "notas"), {
          ...dadosNota,
          uid: user.uid,
          criadoEm: serverTimestamp(),
        });

        await enviarNotificacaoLocal(t("modal_new"), t("note_created_success"));
      }

      onFechar();
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
      Alert.alert(t("attention"), t("save_error"));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent
      onRequestClose={onFechar}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text
              style={styles.titulo}
            >
              {editando ? t("modal_edit") : t("modal_new")}
            </Text>
            <TouchableOpacity onPress={onFechar}>
              <Text style={styles.fechar}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder={t("modal_title")}
            placeholderTextColor="#aaa"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={80}
          />

          <TextInput
            style={[styles.input, styles.inputConteudo]}
            placeholder={t("modal_content")}
            placeholderTextColor="#aaa"
            value={conteudo}
            onChangeText={setConteudo}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.botao}
            onPress={handleSalvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotao}>
                {editando ? t("btn_save") : t("btn_create")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default NotaModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.texto,
  },
  fechar: {
    fontSize: 20,
    color: COLORS.primary,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputConteudo: {
    height: 140,
    paddingTop: 15,
  },
  botao: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
