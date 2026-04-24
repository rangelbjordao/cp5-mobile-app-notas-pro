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
import {
  enviarNotificacaoLocal,
  agendarNotificacaoLembrete,
} from "../services/notificationService";
import DateTimePicker from "@react-native-community/datetimepicker";

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
  const [lembreteAtivo, setLembreteAtivo] = useState(false);
  const [dataLembrete, setDataLembrete] = useState(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);

  const { t } = useTranslation();

  const editando = !!notaExistente;

  useEffect(() => {
    if (notaExistente) {
      setTitulo(notaExistente.titulo);
      setConteudo(notaExistente.conteudo);
      setLembreteAtivo(false);
      setDataLembrete(new Date());
      setMostrarDatePicker(false);
      setMostrarTimePicker(false);
    } else {
      setTitulo("");
      setConteudo("");
    }
  }, [notaExistente, visivel]);

  const formatarDataHora = (data: Date) => {
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const alterarDataLembrete = (_event: any, selectedDate?: Date) => {
    setMostrarDatePicker(false);

    if (selectedDate) {
      const novaData = new Date(dataLembrete);
      novaData.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      setDataLembrete(novaData);
    }
  };

  const alterarHoraLembrete = (_event: any, selectedDate?: Date) => {
    setMostrarTimePicker(false);

    if (selectedDate) {
      const novaData = new Date(dataLembrete);
      novaData.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      setDataLembrete(novaData);
    }
  };

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      Alert.alert(t("attention"), t("field_required"));
      return;
    }

    setSalvando(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      if (editando && notaExistente) {
        await updateDoc(doc(db, "notas", notaExistente.id), {
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
        });

        onFechar();
        return;
      }

      let localizacao = null;

      const permissaoAtual = await Location.getForegroundPermissionsAsync();

      let status = permissaoAtual.status;

      if (status !== "granted") {
        status = await new Promise<Location.PermissionStatus>((resolve) => {
          Alert.alert(
            t("location_permission_title"),
            t("location_permission_message"),
            [
              {
                text: t("deny"),
                style: "cancel",
                onPress: () => resolve(Location.PermissionStatus.DENIED),
              },
              {
                text: t("allow"),
                onPress: async () => {
                  const { status } =
                    await Location.requestForegroundPermissionsAsync();
                  resolve(status);
                },
              },
            ]
          );
        });
      }

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

      await addDoc(collection(db, "notas"), {
        ...dadosNota,
        uid: user.uid,
        criadoEm: serverTimestamp(),
        lembreteAtivo,
        dataLembrete: lembreteAtivo ? dataLembrete.toISOString() : null,
      });

      await enviarNotificacaoLocal(t("modal_new"), t("note_created_success"));

      if (lembreteAtivo) {
        const agora = new Date();

        if (dataLembrete > agora) {
          await agendarNotificacaoLembrete(
            t("reminder_title"),
            `${t("reminder_body")}: ${titulo.trim()}`,
            dataLembrete
          );
        } else {
          Alert.alert(t("attention"), t("reminder_invalid_date"));
        }
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

          <View style={styles.lembreteBox}>
            <TouchableOpacity
              style={styles.lembreteLinha}
              onPress={() => setLembreteAtivo(!lembreteAtivo)}
            >
              <Text style={styles.lembreteTitulo}>{t("reminder_enable")}</Text>
              <Text style={styles.lembreteStatus}>
                {lembreteAtivo ? t("yes") : t("no")}
              </Text>
            </TouchableOpacity>

            {lembreteAtivo && (
              <>
                <Text style={styles.lembreteDataTexto}>
                  {t("reminder_selected")}: {formatarDataHora(dataLembrete)}
                </Text>

                <View style={styles.lembreteBotoes}>
                  <TouchableOpacity
                    style={styles.lembreteBotao}
                    onPress={() => setMostrarDatePicker(true)}
                  >
                    <Text style={styles.lembreteBotaoTexto}>{t("reminder_date")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.lembreteBotao}
                    onPress={() => setMostrarTimePicker(true)}
                  >
                    <Text style={styles.lembreteBotaoTexto}>{t("reminder_time")}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {mostrarDatePicker && (
              <DateTimePicker
                value={dataLembrete}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={alterarDataLembrete}
              />
            )}

            {mostrarTimePicker && (
              <DateTimePicker
                value={dataLembrete}
                mode="time"
                display="default"
                onChange={alterarHoraLembrete}
              />
            )}
          </View>

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
  lembreteBox: {
    marginBottom: 14,
  },
  lembreteLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lembreteTitulo: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.texto,
  },
  lembreteStatus: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  lembreteDataTexto: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.subtitulo,
  },
  lembreteBotoes: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  lembreteBotao: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  lembreteBotaoTexto: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
