import { useRouter } from 'next/router'
import nookies from 'nookies'
import React, { useEffect, useState } from 'react'
import Box from '../../components/Box'
import MainGrid from '../../components/MainGrid'
import { ProfileRelationsBoxWrapper } from '../../components/ProfileRelations'
import { AlurakutMenu, OrkutNostalgicIconSet } from '../../lib/AlurakutCommons'
import { getSeguidores } from '../../services/GitHubService'

function BoxProfile(props) {
    return (
        <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
                {props.titulo} ({props.total})
            </h2>

            <ul>
                {props.items.slice(0, 6).map((item) => {
                    return (
                        <li key={item.key}>
                            <a onClick={()=>props.handleRoute(item.titulo)} key={item.key}>
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

export default function MainPage(props) {
    const router = useRouter();
    const [seguidores, setSeguidores] = useState([]);
    const [comunidades, setComunidades] = useState([]);

    useEffect(async () => {
        if (!props.githubUser) {
            return;
        }
        const response = await getSeguidores(props.githubUser);

        const data = await response.json();
        const seguidoresGit = data.map((seguidor) => {
            return {
                key: seguidor.id, 
                titulo: seguidor.login, 
                urlImagem: seguidor.avatar_url
            }
        });
        setSeguidores(seguidoresGit);
    }, [props.githubUser])

    useEffect(async () => {
        if (!props.githubUser) {
            return;
        }
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
    }, [props.githubUser]);

    return (
        <>
            <AlurakutMenu githubUser={props.githubUser} handleLogout={handleLogout} />
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
                    {props.githubUser === props.loggedUser ? 
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

                        </Box> : null
                    }
                </div>
                <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
                    <BoxProfile 
                        items={seguidores} 
                        titulo={'Seguidores'} 
                        total={props.githubUserInfo.followers}
                        handleRoute={handleProfileSeguidor} />
                    <BoxProfile 
                        items={comunidades} 
                        titulo={'Comunidades'} 
                        total={comunidades.length}
                        handleRoute={()=>{alert('não implementado')}} />
                </div>
            </MainGrid>
        </>
    )

    function handleProfileSeguidor(githubUser) {        
        router.push(`/profile/${githubUser}`);
    }
}



function handleLogout(e) {
    e.preventDefault();
    if (confirm('Deseja realmente sair?')) {
        nookies.destroy(null, 'GITHUB_TOKEN');
        window.location.reload();
    }
}