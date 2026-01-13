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
        <div>
          <div className="container">
            <div className="text-end mt-4">
              <button className="btn btn-primary" onClick={() => openModal({},"new")}>建立新的產品</button>
            </div>
            <table className="table mt-4">
              <thead>
                <tr>
                  <th width="120">分類</th>
                  <th>產品名稱</th>
                  <th width="120">原價</th>
                  <th width="120">售價</th>
                  <th width="100">是否啟用</th>
                  <th width="120">編輯</th>
                </tr>
              </thead>
              <tbody>
                 {products.map((product)=>(
                  <tr key={product.id}>
                  <td style={{ fontSize: "12px" }}>{product.category}</td>
                  <td style={{ fontSize: "12px" }}>{product.title}</td>
                  <td className="text-center">{product.origin_price}</td>
                  <td className="text-center">{product.price}</td>
                  <td>
                    {product.is_enabled ? (
                      <span className="bg-success text-white fw-bold px-2 py-1 rounded-pill">啟用</span>
                    ) : (
                      <span className="bg-danger text-white fw-bold px-2 py-1 rounded-pill">未啟用</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group">
                      <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal(product, "edit")}>
                        編輯
                      </button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => openModal(product, "remove")}>
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
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className={`modal-header ${modalType === "remove" ? "bg-danger" : "bg-dark"} text-white`}>
              <h5 id="productModalLabel" className="modal-title">
                <span>
                   <span>
                  {modalType === "remove"
                    ? "刪除產品"
                    : modalType === "edit"
                    ? "編輯產品"
                    : "新增產品"}
                </span>

                </span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-0">
                      <label htmlFor="imageUrl" className="form-label">
                        輸入圖片網址
                      </label>
                      <input
                        id="imageUrl"
                        type="text"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        value={templateData.imageUrl}
                        onChange={handleModalInputChange}
                        />
                    </div>
                    <img className="img-preview" src={templateData.imageUrl} alt="main" />
                  </div>
                  
                  <div>
                      {templateData.imagesUrl.map((image, index) => (
                        <div key={index} className="mt-2">
                          <input type="text" value={image} placeholder={`圖片網址 ${index + 1}`} className="form-control"
                          onChange={(e) =>
                              handleImageChange(index, e.target.value)
                            }
                          />
                          {/* 檢查「有沒有網址」 */}
                          {image && (<img src={image} alt={`副圖 ${index + 1}`} className="img-preview"/>)}
                        </div>
                      ))}

                      <div className="d-flex justify-content-between mt-2">
                       {/* 新增按鈕 */}
                       {templateData.imagesUrl.length < 5 &&
                       templateData.imagesUrl[templateData.imagesUrl.length - 1] !== "" && (
                       <button type="button" className="btn btn-primary w-50 me-2" onClick={handleAddImage}>
                          新增圖片
                       </button>
                      )}

                      {/* 刪除按鈕 */}
                      {templateData.imagesUrl.length >= 1 && (
                       <button type="button" className="btn btn-outline-danger w-50" onClick={handleRemoveImage}>
                          刪除最後一張
                       </button>
                       )}
                     </div>
                    </div>
                </div>
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">標題</label>
                    <input
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      value={templateData.title}
                      onChange={handleModalInputChange}
                      />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">分類</label>
                      <input
                        id="category"
                        type="text"
                        className="form-control"
                        placeholder="請輸入分類"
                        value={templateData.category}
                        onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">單位</label>
                      <input
                        id="unit"
                        type="text"
                        className="form-control"
                        placeholder="請輸入單位"
                        value={templateData.unit}
                        onChange={handleModalInputChange}
                        />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">原價</label>
                      <input
                        id="origin_price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入原價"
                        value={templateData.origin_price}
                        onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="price" className="form-label">售價</label>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="請輸入售價"
                        value={templateData.price}
                        onChange={handleModalInputChange}
                        />
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">產品描述</label>
                    <textarea
                      id="description"
                      className="form-control"
                      placeholder="請輸入產品描述"
                      value={templateData.description}
                      onChange={handleModalInputChange}
                      ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">說明內容</label>
                    <textarea
                      id="content"
                      className="form-control"
                      placeholder="請輸入說明內容"
                      value={templateData.content}
                      onChange={handleModalInputChange}
                      ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        checked={templateData.is_enabled}
                        onChange={handleModalInputChange}
                        />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
                >
                取消
              </button>
               {modalType === "remove" ? (
                <div>
                  <button type="button" className="btn btn-danger" onClick={() => delProductData(templateData.id)}>
                    刪除
                  </button>
                </div>
              ) : (
                <div>
                  <button type="button" className="btn btn-primary" onClick={() => updateProductData(templateData.id)}>
                    確認
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


export default App;
