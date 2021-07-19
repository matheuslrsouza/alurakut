import { useRouter } from 'next/router'
import nookies from 'nookies'
import React, { useEffect, useState } from 'react'
import Box from '../../components/Box'
import MainGrid from '../../components/MainGrid'
import { ProfileRelationsBoxWrapper } from '../../components/ProfileRelations'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../../lib/AlurakutCommons'
import { comunidadesDoUsuario, recadosDoUsuario } from '../../services/DatoService'
import { getSeguidores } from '../../services/GitHubService'

function ProfileSidebar(props) {
    return (
      <Box as="aside">
        <img src={`https://github.com/${props.githubUser}.png`} style={{ borderRadius: '8px' }} />
        <hr />
  
        <p>
          <a className="boxLink" href={`https://github.com/${props.githubUser}`}>
            @{props.githubUser}
          </a>
        </p>
        <hr />
  
        <AlurakutProfileSidebarMenuDefault />
      </Box>
    )
  }

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

function RecadosForm(props) {
    return (
        <Box>
            <h2 className="subTitle">Deixe um recado para o @{props.githubUser}</h2>
            {<form onSubmit={async (e) => {
                    e.preventDefault();
                    const data = new FormData(e.target);
                    const novoRecado = {
                        mensagem: data.get('mensagem'),
                        usuarioQueEnviou: props.loggedUser,
                        urlFotoUsuarioQueEscreveu: props.urlImagemLoggedUser,
                        usuarioQueRecebeu: props.githubUser,
                    };
                    
                    const resp = await fetch('/api/datocms/979188', {
                        method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(novoRecado)
                    });

                    if (resp.ok) {
                        const record = await resp.json();
                        const recadosAtualizadas = [...props.recados, {...novoRecado, id: record.data.id}];
                        props.setRecados(recadosAtualizadas);
                    } else {
                        console.error(resp);
                    }
                }}>
                <div>
                    <textarea
                        style={{width: '100%', minHeight: '100px'}}
                        required={true}
                        placeholder="Deixe sua mensagem! Se desejar, utilize tags <html>"
                        name="mensagem"
                        aria-label="Deixe sua mensagem! Se desejar, utilize tags <html>"
                        type="text"
                    />
                </div>

                <button>
                    Deixar recado
                </button>
            </form>}

        </Box>
    )
}

function RecadosList(props) {
    return (
        <Box>
            <h2 className="subTitle">Recados que o @{props.githubUser} já recebeu:</h2>
            <ul>
                {props.items.map((item) => {
                    return (
                        <li key={item.id} style={{
                            display: 'grid',
                            gridGap: '8px',
                            gridTemplateColumns: '1fr 4fr',
                            listStyle: 'none',
                        }}>
                            <a>
                                <img src={item.urlFotoUsuarioQueEscreveu} />
                            </a>
                            <span>
                                {item.mensagem.indexOf('</') !== -1
                                ? (
                                    <div dangerouslySetInnerHTML={{__html: item.mensagem.replace(/(<? *script)/gi, 'illegalscript')}} >
                                    </div>
                                  )
                                : item.mensagem
                                }
                            </span>
                        </li>
                    )
                })}
            </ul>
        </Box>
    )
}

function ComunidadesForm(props) {
    return (
        <Box>
            <h2 className="subTitle">Crie uma comunidade!</h2>
            <form onSubmit={async (e) => {
                    e.preventDefault();
                    const data = new FormData(e.target);
                    const novaComunidade = {
                        dono: props.loggedUser,
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
                        const record = await resp.json();
                        const comunidadesAtualizadas = [...props.comunidades, {...novaComunidade, key: record.data.id}];
                        props.setComunidades(comunidadesAtualizadas);
                    } else {
                        console.error(resp);
                    }
                }}>
                <div>
                    <input
                        required={true}
                        placeholder="Qual vai ser o nome da sua comunidade?"
                        name="title"
                        aria-label="Qual vai ser o nome da sua comunidade?"
                        type="text"
                    />
                </div>
                <div>
                    <input
                        required={true}
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
    )
}

export default function MainPage(props) {
    const router = useRouter();
    const [seguidores, setSeguidores] = useState([]);
    const [comunidades, setComunidades] = useState([]);
    const [recados, setRecados] = useState([]);

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
        const response = await comunidadesDoUsuario(props.githubUser);
            
        const json = await response.json();
        if (json.errors) {
            console.error(json.errors);
            return;
        }
        const comunidadesDato = json.data.allComunidades.map(c => {
            return {
                key: c.id, 
                titulo: c.titulo, 
                urlImagem: c.urlImagem
            }
        });
        setComunidades(comunidadesDato);
    }, [props.githubUser]);

    useEffect(async () => {
        if (!props.githubUser) {
            return;
        }
        const response = await recadosDoUsuario(props.githubUser);
        const json = await response.json();
        console.log('recados', json);
        if (json.errors) {
            console.error(json.errors);
            return;
        }
        
        setRecados(json.data.allRecados);
    }, [props.githubUser]);

    function handleProfileSeguidor(githubUser) {        
        router.push(`/profile/${githubUser}`);
    }

    return (
        <>
            <AlurakutMenu githubUser={props.githubUser} handleLogout={handleLogout} />
            <MainGrid>
                <div className="profileArea" style={{ gridArea: 'profileArea' }}>
                    <ProfileSidebar githubUser={props.githubUser} />
                </div>
                <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
                    <Box>
                        <h1 className="title">
                            {props.githubUserInfo.name}
                        </h1>

                        <OrkutNostalgicIconSet recados={recados.length} />
                    </Box>
                    {props.githubUser === props.loggedUser ? 
                        <ComunidadesForm 
                            comunidades={comunidades} 
                            setComunidades={setComunidades} 
                            loggedUser={props.loggedUser}
                        /> : null
                    }

                    <RecadosForm                         
                        setRecados={setRecados}
                        recados={recados}
                        loggedUser={props.loggedUser}
                        urlImagemLoggedUser={props.loggedUserInfo.avatar_url}
                        githubUser={props.githubUser}
                    />
                    <RecadosList 
                        items={recados} 
                        githubUser={props.githubUser}/>

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
}



function handleLogout(e) {
    e.preventDefault();
    if (confirm('Deseja realmente sair?')) {
        nookies.destroy(null, 'GITHUB_TOKEN');
        window.location.reload();
    }
}