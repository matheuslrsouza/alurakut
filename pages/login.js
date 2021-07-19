import React from 'react';
// Hook do NextJS
import { useRouter } from 'next/router';
import { useState } from 'react';
import nookies from 'nookies';

import { isUsuarioValido } from '../src/services/GitHubService'

export default function LoginScreen() {
  const router = useRouter();
  const [model, setModel] = useState({
    githubUser: 'matheuslrsouza',
    error: ''
  });

  return (
    <main style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <div className="loginScreen">
        <section className="logoArea">
          <img src="https://alurakut.vercel.app/logo.svg" />

          <p><strong>Conecte-se</strong> aos seus amigos e familiares usando recados e mensagens instantâneas</p>
          <p><strong>Conheça</strong> novas pessoas através de amigos de seus amigos e comunidades</p>
          <p><strong>Compartilhe</strong> seus vídeos, fotos e paixões em um só lugar</p>
        </section>

        <section className="formArea">
          <form className="box" onSubmit={async (e) => {
                e.preventDefault();
                const isValido = await isUsuarioValido(model.githubUser);

                if (!isValido) {
                    setModel({...model, error: `Usuário ${model.githubUser} não encontrado!`});
                    return;
                }

                const resp = await fetch('https://alurakut.vercel.app/api/login', {
                    method: 'POST',
                    headers: {
                       'Content-Type': 'application/json'  
                    },
                    body: JSON.stringify({ githubUser: model.githubUser })
                });
                const data = await resp.json();
                nookies.set(null, 'GITHUB_TOKEN', data.token);
                router.push('/');
          }}>
            <p>
              Acesse agora mesmo com seu usuário do <strong>GitHub</strong>!
            </p>
            <input                
                placeholder="Usuário GitHub"
                value={model.githubUser}
                onChange={(e) => {
                    setModel({...model, githubUser: e.target.value});
                }}                
            />
            <span style={{color: "red"}}>{model.error}</span>
            <button type="submit">
              Login
            </button>
          </form>

          <footer className="box">
            <p>
              Ainda não é membro? <br />
              <a href="/login">
                <strong>
                  ENTRAR JÁ
              </strong>
              </a>
            </p>
          </footer>
        </section>

        <footer className="footerArea">
          <p>
            © 2021 alura.com.br - <a href="/">Sobre o Orkut.br</a> - <a href="/">Centro de segurança</a> - <a href="/">Privacidade</a> - <a href="/">Termos</a> - <a href="/">Contato</a>
          </p>
        </footer>
      </div>
    </main>
  )
} 