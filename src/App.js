import { useState, useEffect } from "react";
import "./App.css";
import { db, storage } from "./firebaseConnection";
import {
  doc,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button, Form, Container, Row, Col, ListGroup } from "react-bootstrap";

function App() {
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [resenha, setResenha] = useState("");
  const [imagem, setImagem] = useState(null);
  const [posts, setPosts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    buscarPosts();
  }, []);

  async function adicionar() {
    if (!titulo || !autor || !resenha) {
      setErrorMessage("Todos os campos são obrigatórios.");
      return;
    }

    setErrorMessage("");

    try {
      let imageUrl = "";

      if (imagem) {
        const imageRef = ref(storage, `images/${imagem.name}`);
        const uploadResult = await uploadBytes(imageRef, imagem);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const docRef = await addDoc(collection(db, "posts"), {
        titulo: titulo,
        autor: autor,
        resenha: resenha,
        imagemUrl: imageUrl,
      });

      console.log("Dados cadastrados");

      setPosts((prevPosts) => [
        ...prevPosts,
        { id: docRef.id, titulo, autor, resenha, imagemUrl: imageUrl },
      ]);

      // Limpar campos de entrada
      setTitulo("");
      setAutor("");
      setResenha("");
      setImagem(null);
    } catch (error) {
      console.log("Erro ao adicionar post: " + error);
    }
  }

  async function buscarPosts() {
    try {
      const postRef = collection(db, "posts");
      const snapshot = await getDocs(postRef);
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(lista);
    } catch (error) {
      console.log("Erro ao buscar posts: " + error);
    }
  }

  async function carregarPost(id) {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const post = docSnap.data();
      setTitulo(post.titulo);
      setAutor(post.autor);
      setResenha(post.resenha);
      setImagem(null);
    } else {
      console.log("No such document!");
    }
  }

  async function atualizaPost(id) {
    const docRef = doc(db, "posts", id);

    if (!titulo || !autor || !resenha) {
      setErrorMessage("Todos os campos são obrigatórios.");
      return;
    }

    setErrorMessage("");

    try {
      let imageUrl = "";

      if (imagem) {
        const imageRef = ref(storage, `images/${imagem.name}`);
        const uploadResult = await uploadBytes(imageRef, imagem);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      await updateDoc(docRef, {
        titulo: titulo,
        autor: autor,
        resenha: resenha,
        ...(imageUrl && { imagemUrl: imageUrl }),
      });
      console.log("Post atualizado");

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id ? { id, titulo, autor, resenha, imagemUrl: imageUrl || post.imagemUrl } : post
        )
      );

      // Limpar campos de entrada
      setTitulo("");
      setAutor("");
      setResenha("");
      setImagem(null);
    } catch (error) {
      console.log("Erro ao atualizar post: " + error);
    }
  }

  async function excluirPost(id) {
    const docRef = doc(db, "posts", id);
    await deleteDoc(docRef).then(() => {
      alert("Post deletado com sucesso");

      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    });
  }

  return (
    <Container className="my-5">
      <h1 className="text-center">Connecta</h1>
      <Form>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="formTitulo">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o Título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formAutor">
              <Form.Label>Autor</Form.Label>
              <Form.Control
                type="text"
                placeholder="Autor"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="formResenha" className="mb-3">
          <Form.Label>Mensagem</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Escreva sua mensagem aqui..."
            value={resenha}
            onChange={(e) => setResenha(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formImagem" className="mb-3">
          <Form.Label>Imagem</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setImagem(e.target.files[0])}
          />
        </Form.Group>

        <div className="d-flex gap-2">
          <Button variant="primary" onClick={adicionar}>
            Cadastrar
          </Button>
          <Button variant="info" onClick={buscarPosts}>
            Buscar Posts
          </Button>
        </div>
      </Form>

      <h2 className="my-4">Posts Recentes</h2>
      <ListGroup>
        {posts.map((post) => (
          <ListGroup.Item key={post.id} className="mb-3">
            <strong>Título:</strong> {post.titulo} <br />
            <strong>Autor:</strong> {post.autor} <br />
            <strong>Mensagem:</strong> {post.resenha} <br />
            {post.imagemUrl && (
              <img
                src={post.imagemUrl}
                alt="Imagem do Post"
                className="img-post mt-3"
              />
            )}
            <div className="d-flex gap-2 mt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => excluirPost(post.id)}
              >
                Excluir
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={() => {
                  carregarPost(post.id);
                }}
              >
                Editar
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}

export default App;
