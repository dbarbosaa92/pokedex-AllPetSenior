import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "../../constants/theme";
import api from "../services/api";

type Pokemon = {
  id: number;
  name: string;
  sprites?: {
    other?: {
      "official-artwork"?: {
        front_default?: string | null;
      };
    };
  };
  types?: {
    type: {
      name: keyof typeof COLORS.types;
    };
  }[];
};

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showShinyModal, setShowShinyModal] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  //clicar no card
  const handlePokemonClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setShowShinyModal(true);
  };

  //fechar
  const handleCloseModal = () => {
    setShowShinyModal(false);
    setSelectedPokemon(null);
  };

  useEffect(() => {
    async function getPokemons() {
      try {
        const response = await api.get("pokemon?limit=151");

        const payload = await Promise.all(
          response.data.results.map(async (item: { url: string }) => {
            const detail = await api.get(item.url);
            return detail.data as Pokemon;
          }),
        );

        setPokemons(payload);
      } catch (error) {
        console.error("Erro na API:", error);
      } finally {
        setLoading(false);
      }
    }

    getPokemons();
  }, []);

  const filteredPokemons = pokemons.filter((pokemon) => {
    const searchTerm = search.toLowerCase();
    return (
      pokemon.name.toLowerCase().includes(searchTerm) ||
      String(pokemon.id).includes(searchTerm)
    );
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setSearch("");

    try {
      const response = await api.get("pokemon?limit=151");
      const payload = await Promise.all(
        response.data.results.map(async (item: { url: string }) => {
          const detail = await api.get(item.url);
          return detail.data as Pokemon;
        }),
      );
      setPokemons(payload);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={styles.loadingText}>Carregando Pokedex...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokedex</Text>

      {/* Barra de pesquisa */}
      <TextInput
        style={styles.searchBar}
        placeholder="Pesquisar por nome ou número..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredPokemons}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => {
          const mainType = item.types?.[0]?.type?.name ?? "normal";
          const cardColor = COLORS.types[mainType] ?? COLORS.types.normal;

          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: cardColor }]}
              onPress={() => handlePokemonClick(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.id}>#{String(item.id).padStart(3, "0")}</Text>

              <Image
                source={{
                  uri:
                    item.sprites?.other?.["official-artwork"]?.front_default ??
                    undefined,
                }}
                style={styles.pokemonImage}
              />

              <Text style={styles.pokemonName}>{item.name}</Text>

              <View style={styles.typesContainer}>
                {item.types?.map((typeItem) => (
                  <View key={typeItem.type.name} style={styles.typeBadge}>
                    <Text style={styles.typeText}>{typeItem.type.name}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* --- MODAL SHINY --- */}
      <Modal
        visible={showShinyModal}
        transparent={true} // Fundo transparente
        animationType="fade" // Animação suave
        onRequestClose={handleCloseModal} // Para o botão 'Voltar' do Android
      >
        {/* Pressable ocupa a tela toda para fechar ao clicar fora */}
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <View style={styles.modalContent}>
            {selectedPokemon && (
              <>
                <Text style={styles.modalTitle}>Versão Shiny!</Text>

                {/* Imagem Shiny */}
                <Image
                  source={{
                    // Caminho para a sprite Shiny na PokéAPI
                    uri:
                      selectedPokemon.sprites?.other?.["official-artwork"]
                        ?.front_shiny ?? undefined,
                  }}
                  style={styles.shinyImage}
                />

                <Text style={styles.modalPokemonName}>
                  {selectedPokemon.name} ✨
                </Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF0000",
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 18,
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  listContent: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    marginLeft: 10,
  },
  row: {
    justifyContent: "space-between",
  },
  id: {
    position: "absolute",
    right: 10,
    top: 10,
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.45)",
    fontWeight: "bold",
  },
  card: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 15,
    width: "47%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  pokemonName: {
    fontSize: 16,
    textTransform: "capitalize",
    fontWeight: "bold",
    marginTop: 5,
    color: COLORS.white,
  },
  pokemonImage: {
    width: "70%",
    height: "50%",
    resizeMode: "contain",
  },
  typesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 8,
    gap: 5,
  },
  typeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 10,
    textTransform: "capitalize",
    fontWeight: "bold",
    color: COLORS.white,
  },
  searchBar: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fundo escuro semi-transparente
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 10,
  },
  shinyImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  modalPokemonName: {
    fontSize: 18,
    textTransform: "capitalize",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 20,
    color: "#555",
  },
  closeButton: {
    backgroundColor: COLORS.types.fire, // Usa a cor de fogo como padrão
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
