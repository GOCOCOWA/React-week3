import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import "./assets/style.css";

const API_BASE = "https://ec-course-api.hexschool.io/v2";
const API_PATH = "wawata"; 

function App() {
  // modal 
  const productModalRef = useRef(null);
  const [modalType, setModalType] = useState("");
  const [templateData, setTemplateData] = useState({
    id: "",
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    origin_price: "",
    price: "",
    description: "",
    content: "",
    is_enabled: 0,
    imagesUrl: [],
  });

  const openModal=(item, type)=>{
    setTemplateData({
      id: item.id || "",
      imageUrl: item.imageUrl || "",
      title: item.title || "",
      category: item.category || "",
      unit: item.unit || "",
      origin_price: item.origin_price || "",
      price: item.price || "",
      description: item.description || "",
      content: item.content || "",
      is_enabled: item.is_enabled || 0,
      imagesUrl: item.imagesUrl || [],
    });
    setModalType(type);
    productModalRef.current.show();
  };
  const handleModalInputChange=(e)=>{
    const { id, value, type, checked }=e.target;
    setTemplateData((pre)=>({
      ...pre,
      [id]: type === "checkbox" ? checked : value,
    }));
  };
  const handleImageChange = (index, value) => {
  setTemplateData((prevData) => {
    const newImages = [...prevData.imagesUrl];
    newImages[index] = value;

    // 邏輯：只有當「最後一格」被填入內容，且「下一格還沒產生」時，才新增
    if (value !== "" && index === newImages.length - 1 && newImages.length < 5) {
      newImages.push("");
    }

    
    return { ...prevData, imagesUrl: newImages };
  });
  };
  // 新增圖片：直接在陣列最後塞入一個空字串
  const handleAddImage = () => {
  setTemplateData(prev => ({
    ...prev,
    imagesUrl: [...prev.imagesUrl, ""]
  }));
  };

// 刪除圖片：移除陣列中的最後一個元素
   const handleRemoveImage = () => {
    setTemplateData(prev => {
    const newImages = [...prev.imagesUrl];
    newImages.pop(); // 移除最後一項
    return { ...prev, imagesUrl: newImages };
  });
  };
  

  //API
  const [products, setProducts] = useState([]);
  const getProductData=async()=>{
    try{
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(response.data.products);
    }catch(error){
      console.error(error.response.data.message);
    }
  }
  //更新
  const updateProductData=async(id)=>{
    let product;
    if(modalType==='edit'){
      product=`product/${id}`;
    }else{
      product=`product`;
    }
    
     
    const url = `${API_BASE}/api/${API_PATH}/admin/${product}`;

    const productData = {
      data: {
        ...templateData,
        origin_price: Number(templateData.origin_price),
        price: Number(templateData.price),
        is_enabled: templateData.is_enabled ? 1 : 0,
        imagesUrl: templateData.imagesUrl,
      },
    };
    try{
      let response;
      if(modalType==='edit'){
        response=await axios.put(url,productData);
        console.log('更新',response.data);
      }else{
        response=await axios.post(url,productData);
        console.log('新增',response.data);
      }
      productModalRef.current.hide();
      getProductData();
    }catch(err){
      if(modalType === "edit"){
        console.error("更新失敗", err.response.data.message);
      }else{
        console.error("新增失敗", err.response.data.message);
      }
    }

  }
  //remove
  const delProductData=async(id)=>{
    try{
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      console.log("刪除成功", response.data);
      productModalRef.current.hide();
      getProductData();
    }catch(err){
      console.error("刪除失敗", err.response.data.message);
    }
  }


  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setisAuth] = useState(false);
  //const productModalRef = useRef(null);

  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common.Authorization = token;
    productModalRef.current = new bootstrap.Modal('#productModaltest', {
      keyboard: false
    });
    checkAdmin();
    
  }, []);

  const checkAdmin = async() =>{
    try{
      await axios.post(`${API_BASE}/api/user/check`);
      getProductData();
      setisAuth(true);
    }catch (err){
      console.log(err.response.data.message);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((pre) => ({
      ...pre,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common.Authorization = token;
      getProductData();
      setisAuth(true);
    } catch (error) {
      alert("登入失敗: " + error.response.data.message);
    }
  };

  return (
    <>
      {isAuth ? (
        <div className="bg-light min-vh-100 py-4">
  <div className="container">
    {/* 標題列 */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="fw-bold mb-0">產品管理</h2>
      <button
        className="btn btn-primary"
        onClick={() => openModal({}, "new")}
      >
        ＋ 建立新產品
      </button>
    </div>

    {/* Table 卡片化 */}
    <div className="card shadow-sm">
      <div className="card-body p-0">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th width="120" className="text-muted small">分類</th>
              <th className="text-muted small">產品名稱</th>
              <th width="120" className="text-end text-muted small">原價</th>
              <th width="120" className="text-end text-muted small">售價</th>
              <th width="100" className="text-center text-muted small">狀態</th>
              <th width="140" className="text-center text-muted small">操作</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <span className="badge bg-secondary bg-opacity-25 text-dark">
                    {product.category}
                  </span>
                </td>

                <td className="fw-semibold">
                  {product.title}
                </td>

                <td className="text-end text-muted">
                  ${product.origin_price.toLocaleString()}
                </td>

                <td className="text-end text-danger fw-bold">
                  ${product.price.toLocaleString()}
                </td>

                <td className="text-center">
                  <span
                    className={`badge ${
                      product.is_enabled ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {product.is_enabled ? "啟用" : "未啟用"}
                  </span>
                </td>

                <td className="text-center">
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => openModal(product, "edit")}
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => openModal(product, "remove")}
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

      ) : (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                  >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
      <div
  id="productModaltest"
  className="modal fade"
  tabIndex="-1"
  aria-labelledby="productModalLabel"
  aria-hidden="true"
>
  <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div className="modal-content border-0 shadow">

      {/* Modal Header */}
      <div
        className={`modal-header ${
          modalType === "remove" ? "bg-danger" : "bg-primary"
        } text-white`}
      >
        <h5 id="productModalLabel" className="modal-title fw-bold">
          {modalType === "remove"
            ? "刪除產品"
            : modalType === "edit"
            ? "編輯產品"
            : "新增產品"}
        </h5>
        <button
          type="button"
          className="btn-close btn-close-white"
          data-bs-dismiss="modal"
          aria-label="Close"
        />
      </div>

      {/* Modal Body */}
      <div className="modal-body bg-light">
        <div className="row g-4">

          {/* 左側圖片區 */}
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <label htmlFor="imageUrl" className="form-label fw-semibold">
                  主圖片網址
                </label>
                <input
                  id="imageUrl"
                  type="text"
                  className="form-control mb-2"
                  placeholder="請輸入圖片連結"
                  value={templateData.imageUrl}
                  onChange={handleModalInputChange}
                />

                {templateData.imageUrl && (
                  <img
                    src={templateData.imageUrl}
                    alt="主圖"
                    className="img-fluid rounded border mb-3"
                  />
                )}

                <hr />

                {templateData.imagesUrl.map((image, index) => (
                  <div key={index} className="mb-3">
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder={`副圖 ${index + 1}`}
                      value={image}
                      onChange={(e) =>
                        handleImageChange(index, e.target.value)
                      }
                    />
                    {image && (
                      <img
                        src={image}
                        alt={`副圖 ${index + 1}`}
                        className="img-fluid rounded border"
                      />
                    )}
                  </div>
                ))}

                <div className="d-flex gap-2">
                  {templateData.imagesUrl.length < 5 &&
                    templateData.imagesUrl.at(-1) !== "" && (
                      <button
                        type="button"
                        className="btn btn-outline-primary w-100"
                        onClick={handleAddImage}
                      >
                        ＋ 新增圖片
                      </button>
                    )}

                  {templateData.imagesUrl.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={handleRemoveImage}
                    >
                      移除圖片
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右側表單區 */}
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body">

                <div className="mb-3">
                  <label className="form-label fw-semibold">標題</label>
                  <input
                    id="title"
                    type="text"
                    className="form-control"
                    value={templateData.title}
                    onChange={handleModalInputChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">分類</label>
                    <input
                      id="category"
                      type="text"
                      className="form-control"
                      value={templateData.category}
                      onChange={handleModalInputChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">單位</label>
                    <input
                      id="unit"
                      type="text"
                      className="form-control"
                      value={templateData.unit}
                      onChange={handleModalInputChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">原價</label>
                    <input
                      id="origin_price"
                      type="number"
                      className="form-control"
                      value={templateData.origin_price}
                      onChange={handleModalInputChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">售價</label>
                    <input
                      id="price"
                      type="number"
                      className="form-control"
                      value={templateData.price}
                      onChange={handleModalInputChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">產品描述</label>
                  <textarea
                    id="description"
                    className="form-control"
                    rows="2"
                    value={templateData.description}
                    onChange={handleModalInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">說明內容</label>
                  <textarea
                    id="content"
                    className="form-control"
                    rows="3"
                    value={templateData.content}
                    onChange={handleModalInputChange}
                  />
                </div>

                <div className="form-check form-switch">
                  <input
                    id="is_enabled"
                    className="form-check-input"
                    type="checkbox"
                    checked={templateData.is_enabled}
                    onChange={handleModalInputChange}
                  />
                  <label className="form-check-label fw-semibold">
                    是否啟用
                  </label>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Footer */}
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-outline-secondary"
          data-bs-dismiss="modal"
        >
          取消
        </button>

        {modalType === "remove" ? (
          <button
            type="button"
            className="btn btn-danger px-4"
            onClick={() => delProductData(templateData.id)}
          >
            確認刪除
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary px-4"
            onClick={() => updateProductData(templateData.id)}
          >
            儲存變更
          </button>
        )}
      </div>

    </div>
  </div>
</div>

    </>
  );
}


export default App;
