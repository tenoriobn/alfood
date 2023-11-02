import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import http from '../../../http';
import ITag from '../../../interfaces/ITag';
import IRestaurante from '../../../interfaces/IRestaurante';
import { useParams } from 'react-router-dom';
import IPrato from '../../../interfaces/IPrato';

export default function FormularioPrato() {
  const [nomePrato, setNomePrato] = useState('');
  const [descricao, setDescricao] = useState('');

  const [tags, setTags] = useState<ITag[]>([]);
  const [tag, setTag] = useState('');

  const [restaurantes, setRestaurantes] = useState<IRestaurante[]>([]);
  const [restaurante, setRestaurante] = useState(0);

  const [imagem, setImagem] = useState<File | null>(null);

  const parametros = useParams();

  useEffect(() => {
    http.get<{ tags: ITag[] }>('tags/')
      .then(resposta => setTags(resposta.data.tags))

    http.get<IRestaurante[]>('restaurantes/')
      .then(resposta => setRestaurantes(resposta.data))
  }, []);

  useEffect(() => {
    if (parametros.id) {
      http.get<IPrato>(`pratos/${parametros.id}/`)
        .then(resposta => {
          setNomePrato(resposta.data.nome)
          setDescricao(resposta.data.descricao)
          setTag(resposta.data.tag)
          setRestaurante(resposta.data.restaurante);
        })
    }
  }, [parametros])

  const selecionarArquivo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    if (evento.target.files?.length) {
      setImagem(evento.target.files[0])
    } else {
      setImagem(null)
    }
  }

  const aoSubmeterForm = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    const formData = new FormData();

    formData.append('nome', nomePrato)
    formData.append('descricao', descricao)

    formData.append('tag', tag)
    formData.append('restaurante', restaurante.toString())

    if (!parametros.id && imagem) {
      formData.append('imagem', imagem)
    }

    const url = parametros.id ? `pratos/${parametros.id}/` : 'pratos/'
    const method = parametros.id ? 'PUT' : 'POST'

    http.request({
      url,
      method,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
    .then(() => {
      if (parametros.id) {
          alert('Prato atualizado com sucesso!')                    
      } else {
          setNomePrato('')
          setDescricao('')
          setTag('')
          setRestaurante(0)
          alert('Prato cadastrado com sucesso!')
          setImagem(null)
      }
    })
    .catch(erro => console.log(erro))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: "column", alignItems: "center", flexGrow: 1 }}>
      <Typography component="h1" variant="h6">Formulário de Pratos</Typography>
      <Box component="form" sx={{ width: '100%' }} onSubmit={aoSubmeterForm}>
        <TextField
          value={nomePrato}
          onChange={evento => setNomePrato(evento.target.value)}
          label="Nome do Prato"
          variant="standard"
          fullWidth
          required
          margin="dense"
        />
        <TextField
            value={descricao}
            onChange={evento => setDescricao(evento.target.value)}
            label="Descrição do Prato"
            variant="standard"
            fullWidth
            required
            margin="dense"
        />

        <FormControl margin="dense" fullWidth >
          <InputLabel id="select-tag">Tag</InputLabel>
          <Select labelId="select-tag" value={tag} onChange={evento => setTag(evento.target.value)}>
            {tags.map(tag => <MenuItem key={tag.id} value={tag.value}>
              {tag.value}
            </MenuItem>)}
          </Select>
        </FormControl>

        <FormControl margin="dense" fullWidth>
          <InputLabel id="select-restaurante">Restaurante</InputLabel>
          <Select labelId="select-restaurante" value={restaurante} onChange={evento => setRestaurante(Number(evento.target.value))}>
          <MenuItem value={0}>Nenhum restaurante selecionado</MenuItem>
            {restaurantes.map(restaurante => 
              <MenuItem key={restaurante.id} value={restaurante.id}>
                {restaurante.nome}
              </MenuItem>
            )}
          </Select>
        </FormControl>
        
        {!parametros.id && <input type="file" onChange={selecionarArquivo} />}

        <Button sx={{ marginTop: 1 }} type='submit' fullWidth variant="outlined">Salvar</Button>
      </Box>
    </Box>
  )
}
