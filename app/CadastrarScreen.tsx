import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../services/firebaseConfig";
import { criarPerfilUsuario } from "../services/userDataService";
import { COLORS } from "../constants/colors";

export default function CadastroScreen() {
  // Estados para armazenar os valores digitados
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const router = useRouter(); //Hook de navegação

  // Função para simular o envio do formulário
  const handleCadastro = () => {
    if (!nome || !email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }
    createUserWithEmailAndPassword(auth, email, senha)
      .then(async (userCredential) => {
        const user = userCredential.user;

        //Cria/atualiza o perfil inicial em usuarios/{uid}
        await criarPerfilUsuario({
          uid: user.uid,
          email: user.email,
          nome,
        });

        //Salvando o usuário no AsyncStorage
        await AsyncStorage.setItem("@user", JSON.stringify(user));
        router.replace("/Home?novoCadastro=true");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode + " " + errorMessage);

        if (errorCode === "auth/email-already-in-use") {
          Alert.alert("Atenção", "Este e-mail já está em uso.");
        } else if (errorCode === "auth/weak-password") {
          Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");
        } else if (errorCode === "auth/invalid-email") {
          Alert.alert("Atenção", "E-mail inválido.");
        } else {
          Alert.alert(
            "Erro",
            "Não foi possível criar a conta. Tente novamente.",
          );
        }
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>Criar Conta</Text>
        <Text style={styles.subtitulo}>
          Preencha os dados para se cadastrar
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor={COLORS.placeholder}
          value={nome}
          onChangeText={setNome}
        />

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
          placeholder="Senha"
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
          <Text style={styles.textoBotao}>Cadastrar</Text>
        </TouchableOpacity>

        <Link href="/" style={styles.linkLogin}>
          Já tem conta? Entrar
        </Link>
      </View>
    </View>
  );
}

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
  linkLogin: {
    marginTop: 18,
    textAlign: "center",
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "400",
  },
});
