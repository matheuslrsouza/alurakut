import styled from 'styled-components'

import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations'

import { AlurakutMenu, AlurakutStyles, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons'
import React, { useEffect, useState } from 'react'
import nookies from 'nookies';
import jwt from 'jsonwebtoken';

const Title = styled.h1`
  font-size: 50px;
  color: ${({ theme }) => theme.colors.primary};
`

function BoxProfile(props) {
    return (
        <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
                {props.titulo} ({props.items.length})
            </h2>

            <ul>
                {props.items.slice(0, 6).map((item) => {
                    return (
                        <li key={item.key}>
                            <a href={`/users/${item.titulo}`} key={item.key}>
                                <img src={item.urlImagem} />
                                <span>{item.titulo}</span>
                            </a>
                        </li>
                    )
                })}
            </ul>
        </ProfileRelationsBoxWrapper>
    )
}

export default function Home(props) {
    const [seguidores, setSeguidores] = useState([]);

    const [comunidades, setComunidades] = useState([]);

    useEffect(async () => {
        const response = await fetch(`https://api.github.com/users/${props.githubUser}/followers`)
        if (!response.ok) throw Error('falha ao buscar seguidores')

        const data = await response.json();
        const seguidoresGit = data.map((seguidor) => {
            return {
                key: seguidor.id, 
                titulo: seguidor.login, 
                urlImagem: seguidor.avatar_url
            }
        });
        setSeguidores(seguidoresGit);
    }, [])

    useEffect(async () => {
        const response = await fetch('https://graphql.datocms.com/',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DATOCMS_READ_TOKEN}`,
            },
            body: JSON.stringify({
                query: `{
                    allComunidades (
                      filter: {
                        dono: {eq: ${props.githubUser}}
                      }
                    ) {
                      id
                      titulo
                      urlImagem
                    }
                }`
            }),
        }).catch((error) => {
            console.log('ocorreu um erro', error);
        });
        const json = await response.json();
        const comunidadesDato = json.data.allComunidades.map(c => {
            return {
                key: c.id, 
                titulo: c.titulo, 
                urlImagem: c.urlImagem
            }
        });
        setComunidades(comunidadesDato);
    }, []);

    return (
        <>
            <AlurakutMenu githubUser={props.githubUser} />
            <MainGrid>
                <div className="profileArea" style={{ gridArea: 'profileArea' }}>
                    <Box>
                        <img src={`https://github.com/${props.githubUser}.png`} style={{ borderRadius: '8px' }} />
                    </Box>
                </div>
                <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
                    <Box>
                        <h1 className="title">
                            Bem vindo(a)
                    </h1>

                        <OrkutNostalgicIconSet />
                    </Box>
                    <Box>
                        <h2 className="subTitle">O que você deseja fazer?</h2>
                        <form onSubmit={async (e) => {
                                e.preventDefault();
                                const data = new FormData(e.target);
                                const novaComunidade = {
                                    titulo: data.get('title'), 
                                    urlImagem: data.get('image')
                                };
                                
                                const resp = await fetch('/api/comunidade', {
                                    method: 'POST', 
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(novaComunidade)
                                });

                                if (resp.ok) {
                                    const comunidadesAtualizadas = [...comunidades, record];
                                    setComunidades(comunidadesAtualizadas);
                                } else {
                                    console.error(resp);
                                }
                            }}>
                            <div>
                                <input
                                    placeholder="Qual vai ser o nome da sua comunidade?"
                                    name="title"
                                    aria-label="Qual vai ser o nome da sua comunidade?"
                                    type="text"
                                />
                            </div>
                            <div>
                                <input
                                    placeholder="Coloque uma URL para usarmos de capa"
                                    name="image"
                                    aria-label="Coloque uma URL para usarmos de capa"
                                />
                            </div>

                            <button>
                                Criar comunidade
                            </button>
                        </form>

                    </Box>
                </div>
                <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
                    <BoxProfile items={seguidores} titulo={'Seguidores'} />
                    <BoxProfile items={comunidades} titulo={'Comunidades'} />
                </div>
            </MainGrid>
        </>
    )
}

export async function getServerSideProps(context) {
    const TOKEN = nookies.get(context).GITHUB_TOKEN;

    // verifica se o token é válido
    const resp = await fetch('https://alurakut.vercel.app/api/auth', {
        headers: {
            Authorization: TOKEN
        }
    });
    const { isAuthenticated } = await resp.json();

    if (!isAuthenticated) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },        
          }
    }

    const githubUser = jwt.decode(TOKEN).githubUser;

    return {
      props: {
          githubUser: githubUser
      }, // Will be passed to the page component as props
    }
}
  