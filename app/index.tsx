import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../src/services/firebaseConfig";
import { registrarUltimoLogin } from "../src/services/userDataService";
import { COLORS } from "../src/constants/colors";
import { useTranslation } from "react-i18next";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const router = useRouter();

  const { t, i18n } = useTranslation()

  //Verifica se há persistência no Async Storage
  useEffect(() => {
    const verificarUsuarioLogado = async () => {
      try {
        const usuarioSalvo = await AsyncStorage.getItem("@user");
        if (usuarioSalvo) {
          router.replace("/Home");
        }
      } catch (error) {
        console.log("Error ao verificar login: ", error);
      }
    };
    verificarUsuarioLogado(); //Chama a função para verificar se o usuário está logado.
  }, []);

  // Função para simular o envio do formulário
  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert(t("attention"), t("fill_fields"));
      return;
    }
    signInWithEmailAndPassword(auth, email, senha)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        //Atualiza o campo de último login no doc do usuario/{uid}
        await registrarUltimoLogin(user.uid, user.email);

        //Salvando o usuário no AsyncStorage
        await AsyncStorage.setItem("@user", JSON.stringify(user));
        //Redericionar para a tela home
        router.replace("/Home");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        Alert.alert(
          t("attention"),
          t("invalid_credentials"),
          [{ text: "OK" }],
        );
      });
  };

  //Função para alterar o idioma
  const mudarIdioma = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>{t("welcome")}</Text>
        <Text style={styles.subtitulo}>{t("login_sub")}</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={COLORS.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder={t("password")}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={styles.botao} onPress={handleLogin}>
          <Text style={styles.textoBotao}>{t("login_btn")}</Text>
        </TouchableOpacity>

        <Link href="/CadastrarScreen" style={styles.linkCadastrar}>
          {t("link_signup")}
        </Link>
      </View>

      <View style={{ alignItems: "center", marginTop: 30 }}>
        <Text style={{ fontSize: 20 }}>{t("chooselanguage")}</Text>
      </View>

      <View style={styles.idiomaContainer}>
        <TouchableOpacity onPress={() => mudarIdioma("pt")}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={i18n.language === "pt" ? styles.langActive : styles.langInactive}>PT</Text>
            <Image
              source={require("../assets/brasil.png")}
              style={{ width: 30, height: 30 }}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => mudarIdioma("en")}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={i18n.language === "en" ? styles.langActive : styles.langInactive}>EN</Text>
            <Image
              source={require("../assets/usa.png")}
              style={{ width: 30, height: 30 }}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 6,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.texto,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 16,
    color: COLORS.subtitulo,
    textAlign: "center",
    marginBottom: 25,
    marginTop: 6,
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
  botao: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkCadastrar: {
    marginTop: 18,
    textAlign: "center",
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "400",
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
});
