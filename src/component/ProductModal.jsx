function ProductModal({
  modalType,
  templateData,
  handleImgFile,
  handleModalInputChange,
  handleImageChange,
  handleAddImage,
  handleRemoveImage,
  updateProductData,
  delProductData,

}){
    return(
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
                 <label htmlFor="fileInput" className="form-label">
                        圖片上傳
                      </label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="form-control"
                        id="fileInput"
                        onChange={handleImgFile}
                      />

                <hr/>
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
                    <label className="form-label fw-semibold">銷售量</label>
                    <input
                      id="sales_volume"
                      type="number"
                      className="form-control"
                      value={templateData.sales_volume}
                      onChange={handleModalInputChange}
                    />
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
    )
}
export default ProductModal;


