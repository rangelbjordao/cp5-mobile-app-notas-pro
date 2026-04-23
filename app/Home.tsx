import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NotaModal from "../src/components/NotaModal";
import { COLORS } from "../src/constants/colors";
import { auth, db } from "../src/services/firebaseConfig";
import MapaModal from "../src/components/MapaModal";
import { Ionicons } from '@expo/vector-icons';

type Nota = {
  id: string;
  titulo: string;
  conteudo: string;
  localizacao?: { latitude: number; longitude: number };
  criadoEm: any;
};

const Home = () => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState<Nota | null>(null);
  const [mapaVisivel, setMapaVisivel] = useState(false);

  const router = useRouter();
  const { t } = useTranslation()
  const { novoCadastro } = useLocalSearchParams();

  // Mensagem ao criar nova conta
  useEffect(() => {
    if (novoCadastro === "true") {
      Alert.alert(t("welcome_alert"), t("success_alert"));
    }
  }, [novoCadastro]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Ordena as notas por data de criação(mais recente ficará no topo)
      const notasQuery = query(
        collection(db, "notas"),
        where("uid", "==", user.uid),
        orderBy("criadoEm", "desc"),
      );
      const unsubscribeNotas = onSnapshot(notasQuery, (snapshot) => {
        const lista: Nota[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Nota[];
        setNotas(lista);
        setLoading(false);
      });

      return () => unsubscribeNotas();
    });

    return () => unsubscribeAuth();
  }, []);

  const realizarLogout = async () => {
    await AsyncStorage.removeItem("@user"); //Limpa o usuário do Async
    router.replace("/");
  };

  const abrirCriar = () => {
    setNotaSelecionada(null);
    setModalVisivel(true);
  };

  const abrirEditar = (nota: Nota) => {
    setNotaSelecionada(nota);
    setModalVisivel(true);
  };

  const abrirMapa = (nota: Nota) => {
    setNotaSelecionada(nota);
    setMapaVisivel(true);
  };

  const confirmarDeletar = (id: string) => {
    Alert.alert(t("delete_note_title"), t("delete_note_message"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("delete"), style: "destructive", onPress: () => deletarNota(id) },
    ]);
  };

  const deletarNota = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notas", id));
    } catch (error) {
      Alert.alert(t("generic_error"), t("delete_error"));
    }
  };

  const renderNota = ({ item }: { item: Nota }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardTextos}
        onPress={() => abrirEditar(item)}
      >
        <Text style={styles.cardTitulo} numberOfLines={1}>
          {item.titulo}
        </Text>
        <Text style={styles.cardConteudo} numberOfLines={2}>
          {item.conteudo}
        </Text>

        {item.localizacao && (
          <TouchableOpacity
            onPress={() => abrirMapa(item)}
            style={styles.localizacaoBotao}
          >
            <Ionicons name="location-sharp" size={16} color={COLORS.primary} />
            <Text style={styles.localizacaoTexto}>
              {t("view_map")}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.botaoDeletar}
        onPress={() => confirmarDeletar(item.id)}
      >
        <Text style={styles.textoDeletar}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>{t("home_title")}</Text>
        <TouchableOpacity onPress={realizarLogout}>
          <Text style={styles.logout}>{t("logout")}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 40 }}
        />
      ) : notas.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>{t("empty_list_title")}</Text>
          <Text style={styles.vazioSubtitulo}>{t("empty_list_subtitle")}</Text>
        </View>
      ) : (
        <FlatList
          data={notas}
          keyExtractor={(item) => item.id}
          renderItem={renderNota}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        // Botao para adicionar nova nota
        style={styles.botaoCriar}
        onPress={abrirCriar}
      >
        <Text style={styles.botaoCriarTexto}>+</Text>
      </TouchableOpacity>


      <MapaModal
        visivel={mapaVisivel}
        onFechar={() => {
          setMapaVisivel(false);
          setNotaSelecionada(null);
        }}
        localizacao={notaSelecionada?.localizacao || null}
        tituloNota={notaSelecionada?.titulo}
      />

      <NotaModal
        visivel={modalVisivel}
        onFechar={() => setModalVisivel(false)}
        notaExistente={notaSelecionada}
      />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.texto,
  },
  botao: {
    backgroundColor: "#0a0a0a",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logout: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTextos: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.texto,
    marginBottom: 4,
  },
  cardConteudo: {
    fontSize: 14,
    color: COLORS.subtitulo,
  },
  botaoDeletar: {
    padding: 8,
    marginLeft: 8,
  },
  textoDeletar: {
    fontSize: 18,
    color: "#EF4444",
  },
  botaoCriar: {
    position: "absolute",
    bottom: 32,
    right: 24,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  botaoCriarTexto: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
  },
  vazio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  vazioTexto: {
    fontSize: 18,
    color: COLORS.texto,
    fontWeight: "600",
  },
  vazioSubtitulo: {
    fontSize: 14,
    color: COLORS.subtitulo,
    marginTop: 6,
  },
  idiomaContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
  },
  langActive: {
    fontWeight: "bold",
    color: COLORS.primary,
    fontSize: 16,
  },
  langInactive: {
    color: COLORS.subtitulo,
    fontSize: 16,
  },
  localizacaoBotao: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  localizacaoTexto: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  }
});
