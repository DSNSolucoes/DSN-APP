import React, { useEffect, useState } from "react";
import "./RelatorioP900.css";
import "./_relatorioBase.css";
import { GridGenerico } from "../grid/GridGenerico";
import { relatoriosService } from "../../api/relatoriosService";
import { useEmpresa } from "../../context/EmpresaContext";
import { EmpresaSelecao } from "../EmpresaSelecao/EmpresaSelecao";
import { combosService } from "../../services/combosService";
import { Paginacao } from "../Paginacao/Paginacao"; 

export function RelatorioP900({ exibirFiltro }) {
  const { empresa, setEmpresa } = useEmpresa();

  const [grupos, setFornecedors] = useState([]);
  const [grupoId, setFornecedorId] = useState(0);

  const [modoExibicao, setModoExibicao] = useState(1);

  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [page, setPage] = useState(1);          // 1-based
  const [pageSize, setPageSize] = useState(20); // 20, 50, 200, 0 (Tudo)

  // ordenação do grid (três estados: null -> asc -> desc -> null)
  const [ordenacao, setOrdenacao] = useState({
    colunaOrdenacao: null, // ex: "descricao"
    direcao: null,         // "asc" | "desc" | null
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!empresa?.id) return;
    combosService
      .obterFornecedores(empresa.id)
      .then((g) => setFornecedors(g || []))
      .catch(() => {});
  }, [empresa?.id]);

  // reset pagina quando mudar filtro/empresa/tamanho/visualizacao
  useEffect(() => {
    setPage(1);
  }, [empresa?.id, grupoId, modoExibicao, pageSize]);

  // colunas do grid
  const colunasGrid = [
    { descricaoColunaGrid: "Código de barras", tamanho: 20, colunaOrdenacao: "codBarras" },
    { descricaoColunaGrid: "Código de referência", tamanho: 15, colunaOrdenacao: "codReferencia" },
    { descricaoColunaGrid: "Nome do fornecedor", tamanho: 30, colunaOrdenacao: "fornecedor" },
    { descricaoColunaGrid: "Descrição", tamanho: 25, colunaOrdenacao: "descricao" },
    { descricaoColunaGrid: "Quantidade", tamanho: 10, colunaOrdenacao: "estoque" },
  ];

  const buildParams = (sort = ordenacao, p = page, ps = pageSize) => ({
    lojaId: empresa?.id,
    grupoId,
    modoExibicao,
    pagina: p,
    itensPorPagina: ps, // 0 = Tudo
    ordenarPor: sort?.colunaOrdenacao,   // backend
    ordenarDirecao: sort?.direcao,       // "asc" | "desc" | null
  });

  const gerarComOrdenacao = async (sortOverride) => {
    if (!empresa?.id) return setErro("Selecione uma empresa.");
    setErro("");
    setLoading(true);

    try {
      const params = buildParams(sortOverride ?? ordenacao, page, pageSize);
      const res = await relatoriosService.obterP900(params);

      const itens = res?.lista ?? [];
      const qtd = res?.qtdRegistro ?? 0;

      setData(Array.isArray(itens) ? itens : []);
      setTotalRecords(Number(qtd) || 0);
    } catch (e) {
      setErro(e.message || "Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const gerar = async () => {
    return gerarComOrdenacao();
  };

  // quando mudar pagina, recarrega
  useEffect(() => {
    if (!empresa?.id) return;
    gerar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const exportar = async () => {
    if (!empresa?.id) return setErro("Selecione uma empresa.");
    setErro("");
    try {
      const params = buildParams();
      const blob = await relatoriosService.exportarP900(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Relatorio-P900.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErro(e.message || "Erro ao exportar");
    }
  };

  return (
    <div className="relatorio">
      <div className="relatorio-empresa">
        <EmpresaSelecao empresaSelecionadaId={empresa?.id} onChangeEmpresa={setEmpresa} />
      </div>

      {exibirFiltro && (
        <div className="relatorio-filtros">
          <div className="grid-2">
            <div>
              <label>Fornecedor</label>
              <select value={grupoId} onChange={(e) => setFornecedorId(Number(e.target.value))}>
                <option value={0}>Todos</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.descricao || g.nome || g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Modo Exibição</label>
              <select value={modoExibicao} onChange={(e) => setModoExibicao(Number(e.target.value))}>
                <option value={1}>Grid</option>
                <option value={2}>Card</option>
              </select>
            </div>
          </div>

          <div className="actions">
            <button className="primary" onClick={gerar} disabled={loading}>
              {loading ? "Gerando..." : "Gerar Relatório"}
            </button>
            <button className="secondary" onClick={exportar}>
              Exportar
            </button>
          </div>
        </div>
      )}

      {erro && <p className="erro">{erro}</p>}

      {modoExibicao === 2 ? (
        <div className="cards">
          {data.map((item, idx) => (
            <div className="card rel-card" key={idx}>
              <h3>{item.nomeProduto || item.descricao || "Produto"}</h3>
              <ul>
                <li><strong>Código de barras:</strong> {item.codBarras}</li>
                <li><strong>Código de referência:</strong> {item.codReferencia}</li>
                <li><strong>Nome do fornecedor:</strong> {item.fornecedor}</li>
                <li><strong>Descrição:</strong> {item.descricao}</li>

                <li><strong>Quantidade:</strong> {item.estoque}</li>
                
                <li  ><strong>Quantidade:</strong> {item.estoque}</li>

              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="tableWrap">
          <GridGenerico
            data={data}
            columns={colunasGrid}
            sort={ordenacao}
            onSortChange={(nextSort) => {
              setOrdenacao(nextSort);
              setPage(1); // volta pra página 1 ao mudar ordenação
              // chama gerar com a ordenação nova (sem depender do setState)
              gerarComOrdenacao(nextSort);
            }}
            // opcional: se tiver id único, use aqui. Se não, pode remover.
            keyField={null}
            // opcional: se quiser formatar célula (ex: estoque)
            renderCell={(row, col) => {
              switch (col.colunaOrdenacao) {
                case "estoque":
                  return row.estoque ?? 0;
                default:
                  return row?.[col.colunaOrdenacao] ?? "";
              }
            }}
          />
        </div>
      )}

      {/* PAGINAÇÃO */}
      {!erro && (
        <Paginacao
          page={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onChangePage={(p) => setPage(p)}
          onChangePageSize={(s) => {
            setPage(1);
            setPageSize(s);
          }}
          disabled={loading}
        />
      )}
    </div>
  );
}