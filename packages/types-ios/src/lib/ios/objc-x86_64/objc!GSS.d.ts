
declare var __gss_c_attr_local_login_user: gss_buffer_desc;

declare var __gss_krb5_nt_principal_name_oid_desc: gss_OID_desc;

declare var __gss_krb5_nt_principal_name_referral_oid_desc: gss_OID_desc;

declare var __gss_krb5_nt_principal_oid_desc: gss_OID_desc;

declare var __gss_spnego_mechanism_oid_desc: gss_OID_desc;

interface gss_OID_desc {
	length: number;
	elements: interop.Pointer | interop.Reference<any> | null;
}
declare var gss_OID_desc: interop.StructType<gss_OID_desc>;

interface gss_OID_set_desc {
	count: number;
	elements: interop.Pointer | interop.Reference<gss_OID_desc> | null;
}
declare var gss_OID_set_desc: interop.StructType<gss_OID_set_desc>;

interface gss_buffer_desc {
	length: number;
	value: interop.Pointer | interop.Reference<any> | null;
}
declare var gss_buffer_desc: interop.StructType<gss_buffer_desc>;

interface gss_buffer_set_desc {
	count: number;
	elements: interop.Pointer | interop.Reference<gss_buffer_desc> | null;
}
declare var gss_buffer_set_desc: interop.StructType<gss_buffer_set_desc>;

interface gss_channel_bindings_struct {
	initiator_addrtype: number;
	initiator_address: gss_buffer_desc;
	acceptor_addrtype: number;
	acceptor_address: gss_buffer_desc;
	application_data: gss_buffer_desc;
}
declare var gss_channel_bindings_struct: interop.StructType<gss_channel_bindings_struct>;

interface gss_iov_buffer_desc {
	type: number;
	buffer: gss_buffer_desc;
}
declare var gss_iov_buffer_desc: interop.StructType<gss_iov_buffer_desc>;

interface gss_krb5_cfx_keydata_t {
	have_acceptor_subkey: number;
	ctx_key: gss_krb5_lucid_key_t;
	acceptor_subkey: gss_krb5_lucid_key_t;
}
declare var gss_krb5_cfx_keydata_t: interop.StructType<gss_krb5_cfx_keydata_t>;

interface gss_krb5_lucid_context_v1_t {
	version: number;
	initiate: number;
	endtime: number;
	send_seq: number;
	recv_seq: number;
	protocol: number;
	rfc1964_kd: gss_krb5_rfc1964_keydata_t;
	cfx_kd: gss_krb5_cfx_keydata_t;
}
declare var gss_krb5_lucid_context_v1_t: interop.StructType<gss_krb5_lucid_context_v1_t>;

interface gss_krb5_lucid_context_version_t {
	version: number;
}
declare var gss_krb5_lucid_context_version_t: interop.StructType<gss_krb5_lucid_context_version_t>;

interface gss_krb5_lucid_key_t {
	type: number;
	length: number;
	data: interop.Pointer | interop.Reference<any> | null;
}
declare var gss_krb5_lucid_key_t: interop.StructType<gss_krb5_lucid_key_t>;

interface gss_krb5_rfc1964_keydata_t {
	sign_alg: number;
	seal_alg: number;
	ctx_key: gss_krb5_lucid_key_t;
}
declare var gss_krb5_rfc1964_keydata_t: interop.StructType<gss_krb5_rfc1964_keydata_t>;
