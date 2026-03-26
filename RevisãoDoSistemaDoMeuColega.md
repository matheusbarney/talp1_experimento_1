Revisão de Sistema  
Projeto: [https://github.com/ThalesBezerra21/vibe\_prova](https://github.com/ThalesBezerra21/vibe_prova)  
Revisão por Matheus Barney Mara Galindo  
Projeto de Thales de Oliveira Bezerra 

1\. O sistema está funcionando com as funcionalidades solicitadas?  
O agente do colega Thales Bezerra desenvolveu o sistema “Vibe Prova”, e ao rodar na minha máquina para sua revisão consegui confirmar o funcionamento das 4 features principais do sistema: É possível gerenciar perguntas no banco de questões no app, que pode ser consultado na criação de novas provas na rota “provas”. Clicando nessa seção no card de uma das provas, pode-se criar PDFs e um gabarito, que são usados em uma aba de correção de prova, que corretamente considera os dois tipos de avaliar questões. Da mesma forma, os PDFs gerados parecem seguir as especificações da atividade, E nas questões foi corretamente considerado identificação de alternativas com letras e com fatores de 2\.

2\. Quais os problemas de qualidade do código e dos testes?  
O código criado pelo agente no seu geral apresenta uma ótima qualidade de código. O servidor apresenta boa estrutura, e o front end tem ótima organização e em especial eu pontuaria um ótimo nível de componentização, algo que (meu modelo antes de certos prompts, por exemplo) outros agentes com outros prompts poderiam não ter feito. Elementos de UI recorrentes como botões e caixas de input foram sim propriamente reutilizados com consistência.   
No geral também senti que os testes cobriram boa parte dos casos, mas também verifiquei steps pendentes ou vazios, e uma falta de validação de conteúdo como, por exemplo, o PDF gerado no processo.   
Um problema menor que verifiquei na prática é a possibilidade de ter mais de uma pergunta marcada na criação de questões no modo Múltipla Escolha com 1 correta, e a falta de um erro de validação ao submetê-lo assim. Aliás, pode-se comentar no agente ter criado um sistema com 2 opções redundantes (Múltipla Escolha com 1 correta e Múltipla Escolha com Várias Corretas) como um pequeno deslize do agente no quesito de praticidade e usabilidade.  
A interface não foi prioridade nessa entrega, mas algumas das inclusões “extras” podem ter fugido das intenções das especificações, como por exemplo a necessidade de um login, a habilidade de adicionar questões fora do banco de questões nas provas, e até a tela de início redundante, que apresenta as mesmas opções que o header que acompanha todas as páginas.

3\. Como a funcionalidade e a qualidade desse sistema pode ser comparada com as do seu  
sistema?  
Com certeza eu diria que o projeto do colega ficou bem mais apresentável, devido em grande parte às prompts iniciais incentivarem o uso de bibliotecas de UI e afins (que no meu projeto, na verdade, o agente até evitou por eu falar tanto de deixar o código streamlined). Ademais, percebo só agora na revisão que meu produto faltou mesmo algum título como o “Vibe Prova”, e possivelmente mais páginas, até pra ver como o agente manda ver o roteamento.   
Nós 2 entregamos bem o MVP, embora eu percebo um pequeno equívoco na forma em que interpretei o quesito de “provas individuais”, pois também considerei 2 ou mais alunos ter a mesma variante da prova. Acho que posso aprender da forma que o Thales, que pelo que vejo do Github tem experiência com agentes, arquitetou os prompts dele, pois ele conseguiu ir além do esqueleto básico das especificações de uma forma interessante.

